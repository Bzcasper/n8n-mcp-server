#!/usr/bin/env node
/* eslint-env node */
// Runtime JS version of import-workflows (exec after npm run build)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  loadEnvironmentVariables,
  getEnvConfig,
} from "../build/config/environment.js";
import dotenv from "dotenv";
import { createApiClient } from "../build/api/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const doActivate = process.argv.includes("--activate");
  // Attempt normal load (looks for .env relative to package roots)
  loadEnvironmentVariables();
  if (!process.env.N8N_API_URL || !process.env.N8N_API_KEY) {
    // Try repo root one level up
    const rootEnv = path.resolve(__dirname, "..", "..", ".env");
    if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  }
  let config = getEnvConfig();
  let client = createApiClient(config);
  try {
    await client.checkConnectivity();
  } catch (e) {
    const msg = (e && e.message) || "";
    // Fallback: if host is 'n8n' and DNS fails, retry with localhost
    try {
      const url = new URL(config.n8nApiUrl);
      if (
        (msg.includes("ENOTFOUND") || msg.includes("EAI_AGAIN")) &&
        url.hostname === "n8n"
      ) {
        url.hostname = "localhost";
        process.env.N8N_API_URL = url.toString();
        console.warn(
          '[import] DNS resolution failed for host "n8n". Retrying with',
          process.env.N8N_API_URL
        );
        config = getEnvConfig();
        client = createApiClient(config);
        await client.checkConnectivity();
      } else throw e;
    } catch (inner) {
      console.error("[import] Connectivity failed:", inner.message);
      throw inner;
    }
  }
  const existing = await client.getWorkflows();
  const byName = Object.fromEntries(existing.map((w) => [w.name, w]));
  const workflowDir = path.resolve(process.cwd(), "workflows");
  const targetFiles = [
    "workflow6_audio_transcription_whisper.json",
    "workflow7_qwen_embeddings_vector_search.json",
    "workflow8_advanced_error_retry.json",
    "workflow9_multimodal_processing.json",
    "workflow10_rag_qdrant.json",
    "workflow11_audio_to_music_video.json",
    "workflow12_audio_to_music_video_advanced.json",
  ];
  const results = [];
  for (const file of targetFiles) {
    const full = path.join(workflowDir, file);
    if (!fs.existsSync(full)) {
      results.push({ workflow: "UNKNOWN", file, error: "missing" });
      continue;
    }
    try {
      const wfRaw = JSON.parse(fs.readFileSync(full, "utf-8"));
      const json = sanitizeWorkflow(wfRaw);
      applyPlaceholderSubstitutions(json);
      if (Array.isArray(json.nodes)) {
        for (const n of json.nodes) {
          if (n.credentials) {
            for (const k of Object.keys(n.credentials)) {
              const cred = n.credentials[k];
              if (cred?.id && cred.id.startsWith("__REPLACE_")) delete cred.id;
            }
          }
        }
      }
      delete json.tags;
      const existingWf = byName[json.name];
      if (existingWf) {
        const upd = await client.updateWorkflow(existingWf.id, {
          name: json.name,
          nodes: json.nodes,
          connections: json.connections,
          settings: json.settings || {},
          staticData: json.staticData || null,
        });
        if (doActivate)
          try {
            await client.activateWorkflow(upd.id);
            results.push({
              workflow: json.name,
              file,
              updated: upd.id,
              activated: true,
            });
          } catch (e) {
            results.push({
              workflow: json.name,
              file,
              updated: upd.id,
              error: e.message,
            });
          }
        else results.push({ workflow: json.name, file, updated: upd.id });
      } else {
        const created = await client.createWorkflow(json);
        if (doActivate)
          try {
            await client.activateWorkflow(created.id);
            results.push({
              workflow: json.name,
              file,
              created: created.id,
              activated: true,
            });
          } catch (e) {
            results.push({
              workflow: json.name,
              file,
              created: created.id,
              error: e.message,
            });
          }
        else results.push({ workflow: json.name, file, created: created.id });
      }
    } catch (e) {
      results.push({ workflow: "UNKNOWN", file, error: e.message });
    }
  }
  console.table(results);
  if (results.some((r) => r.error)) process.exitCode = 1;
}

/**
 * Sanitize a workflow definition exported or hand-authored so it matches
 * the n8n API schema expectations.
 * Adjustments:
 *  - remove node.id (internal editor field)
 *  - coerce typeVersion to integer
 *  - unwrap resource list selector objects like { __rl: true, value: 'model' }
 *  - replace OpenAI model param objects with plain string value
 */
function sanitizeWorkflow(workflow) {
  const clone = JSON.parse(JSON.stringify(workflow));
  // Keep only allowed root keys for create
  const allowedRoot = new Set(["name", "nodes", "connections"]);
  for (const key of Object.keys(clone)) {
    if (!allowedRoot.has(key)) delete clone[key];
  }
  if (Array.isArray(clone.nodes)) {
    clone.nodes = clone.nodes.map((node) => {
      const n = { ...node };
      delete n.id; // not accepted on create
      if (typeof n.typeVersion === "number") {
        n.typeVersion = Math.floor(n.typeVersion);
      }
      if (n.parameters) {
        // unwrap model selector objects produced by UI reactive lists
        if (n.parameters.model && typeof n.parameters.model === "object") {
          if (typeof n.parameters.model.value === "string") {
            n.parameters.model = n.parameters.model.value;
          }
        }
      }
      return n;
    });
  }
  return clone;
}

/**
 * Replace placeholder host tokens in node HTTP parameter URLs with real env values.
 * Supported placeholders:
 *  - __QDRANT_HOST__  -> QDRANT_HOST env (may include protocol). Falls back to process.env.QDRANT_URL
 *  - __VIDEO_ASSEMBLY_HOST__ -> VIDEO_ASSEMBLY_HOST env (falls back to localhost:8080)
 */
function applyPlaceholderSubstitutions(wf) {
  if (!Array.isArray(wf.nodes)) return;
  const qdrantEnv =
    process.env.QDRANT_HOST ||
    process.env.QDRANT_URL ||
    process.env.QDRANT_BASE_URL;
  const videoEnv = process.env.VIDEO_ASSEMBLY_HOST || "localhost:8080";
  for (const node of wf.nodes) {
    if (node?.parameters?.url && typeof node.parameters.url === "string") {
      let url = node.parameters.url;
      if (url.includes("__QDRANT_HOST__")) {
        if (qdrantEnv) {
          url = substituteHost(url, "__QDRANT_HOST__", qdrantEnv, "https");
        }
      }
      if (url.includes("__VIDEO_ASSEMBLY_HOST__")) {
        if (videoEnv) {
          url = substituteHost(
            url,
            "__VIDEO_ASSEMBLY_HOST__",
            videoEnv,
            "http"
          );
        }
      }
      node.parameters.url = url;
    }
  }
}

function substituteHost(originalUrl, token, envValue) {
  // originalUrl contains something like https://__TOKEN__/path
  // envValue may be host, host:port or full URL with protocol
  const clean = envValue.replace(/\/$/, "");
  if (/^https?:\/\//i.test(clean)) {
    // Replace scheme+token portion
    return originalUrl.replace(new RegExp(`https?://${token}`), clean);
  }
  // env lacks protocol -> just swap token
  return originalUrl.replace(token, clean);
}
main();
