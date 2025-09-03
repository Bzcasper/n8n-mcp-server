#!/usr/bin/env node
/* eslint-env node */

// Rebuilt clean test harness with composite webhook path support.

import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import https from "https";
import dotenv from "dotenv";

// Load env (support monorepo root) then local .env
const rootEnv = path.resolve(process.cwd(), "..", ".env");
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
dotenv.config();

async function main() {
  const explicitBase = process.env.N8N_TEST_BASE_URL || process.env.WEBHOOK_URL;
  const proto = (process.env.N8N_PROTOCOL || "http").replace(/:$/, "");
  const host = process.env.N8N_HOST || "localhost";
  const port = process.env.N8N_PORT || 5678;
  const baseUrl = explicitBase
    ? explicitBase.replace(/\/$/, "")
    : `${proto}://${host}${port ? `:${port}` : ""}`;
  const cleanedBase = baseUrl.replace(/\/$/, "");
  const webhookBase = `${cleanedBase}/webhook`;
  // Add local base (direct) first if external domain used
  const localDirect = `http://localhost:${port}`.replace(/\/$/, "");
  const attemptBases = cleanedBase.includes("localhost")
    ? [cleanedBase]
    : [localDirect, cleanedBase];
  console.log(
    "Base URL:",
    baseUrl,
    "Webhook Base:",
    webhookBase,
    "Attempt bases:",
    attemptBases
  );

  const apiKey = process.env.N8N_API_KEY;
  const basicUser = process.env.N8N_BASIC_AUTH_USER;
  const basicPass = process.env.N8N_BASIC_AUTH_PASSWORD;
  const basicActive = /^(true|1|yes)$/i.test(
    process.env.N8N_BASIC_AUTH_ACTIVE || ""
  );
  console.log(
    "API key present:",
    apiKey ? apiKey.slice(0, 10) + "..." : "none"
  );

  const client = axios.create({
    baseURL: baseUrl,
    timeout: 45_000,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    validateStatus: undefined,
    headers: apiKey
      ? { "X-N8N-API-KEY": apiKey, "x-n8n-api-key": apiKey }
      : undefined,
    auth:
      basicActive && basicUser && basicPass
        ? { username: basicUser, password: basicPass }
        : undefined,
  });
  // Fallback: set header after creation too
  if (apiKey) {
    client.defaults.headers.common["X-N8N-API-KEY"] = apiKey;
    client.defaults.headers.common["x-n8n-api-key"] = apiKey;
  }
  console.log("Client headers:", client.defaults.headers.common);

  // Build composite webhook path mapping by inspecting active workflows
  const pathMap = new Map(); // simplePath -> Set(fullComposite variants)
  async function fetchWorkflows() {
    const pathsToTry = ["/rest/workflows", "/api/v1/workflows"];
    for (const p of pathsToTry) {
      try {
        const r = await client.get(p);
        console.log(p, "status", r.status);
        if (r.status === 200)
          return r.data?.data || r.data?.workflows || r.data;
      } catch (e) {
        console.warn("fetch attempt", p, e.message);
      }
    }
    return [];
  }
  const wfList = await fetchWorkflows();
  for (const wf of Array.isArray(wfList) ? wfList : []) {
    if (!wf || !wf.active) continue;
    const id = wf.id || wf.workflowId;
    for (const node of wf.nodes || []) {
      if (node.type !== "n8n-nodes-base.webhook") continue;
      const p = node.parameters?.path;
      if (!p) continue;
      const rawName = node.name;
      const encName = encodeURIComponent(rawName);
      const lowerName = rawName.toLowerCase();
      const variants = new Set([
        `${id}/${encName}/${p}`,
        `${id}/${rawName}/${p}`,
        `${id}/${lowerName}/${p}`,
        `${id}/${encodeURIComponent(lowerName)}/${p}`,
      ]);
      if (!pathMap.has(p)) pathMap.set(p, new Set());
      const set = pathMap.get(p);
      for (const v of variants) set.add(v);
    }
  }
  console.log(
    "Composite path candidates built:",
    [...pathMap.entries()].map(([k, v]) => [k, [...v]])
  );
  // Direct override from DB snapshot (exact registered webhookPath values)
  const directPaths = [
    "0nfkrrQZZddqMCcu/webhook%20task%20request/retry-task",
    "5Tk3cflgLKX1NfDV/webhook%20audio%20upload/music-video-advanced",
    "XNiTWsE2dQssHSyG/webhook%20audio%20upload/audio-transcribe",
    "ZfUulwUaIjkVWyyQ/webhook%20ingest%2Fquery/qdrant-rag",
    "fBdxKZ5vugOIpE2F/webhook%20multi-modal/multi-modal",
    "fQJrcC4uVPxyEoDS/webhook%20audio%20upload/music-video",
    "lVjGHg4pDkx5rpTa/webhook%20text%20input/qwen-embed",
  ];
  function addDirect(label, simple, full) {
    if (!pathMap.has(simple)) pathMap.set(simple, new Set());
    pathMap.get(simple).add(full);
  }
  // Map simple names to direct full paths
  addDirect("retry-task", "retry-task", directPaths[0]);
  addDirect("music-video-advanced", "music-video-advanced", directPaths[1]);
  addDirect("audio-transcribe", "audio-transcribe", directPaths[2]);
  addDirect("qdrant-rag", "qdrant-rag", directPaths[3]);
  addDirect("multi-modal", "multi-modal", directPaths[4]);
  addDirect("music-video", "music-video", directPaths[5]);
  addDirect("qwen-embed", "qwen-embed", directPaths[6]);

  // Route override map (simplePath -> ordered attempts: short first, then composite)
  const routeOverrides = {
    "audio-transcribe": [
      "audio-transcribe",
      "XNiTWsE2dQssHSyG/webhook%20audio%20upload/audio-transcribe",
    ],
    "qwen-embed": [
      "qwen-embed",
      "lVjGHg4pDkx5rpTa/webhook%20text%20input/qwen-embed",
    ],
    "retry-task": [
      "retry-task",
      "0nfkrrQZZddqMCcu/webhook%20task%20request/retry-task",
    ],
    "multi-modal": [
      "multi-modal",
      "fBdxKZ5vugOIpE2F/webhook%20multi-modal/multi-modal",
    ],
    "qdrant-rag": [
      "qdrant-rag",
      "ZfUulwUaIjkVWyyQ/webhook%20ingest%2Fquery/qdrant-rag",
    ],
    "music-video": [
      "music-video",
      "fQJrcC4uVPxyEoDS/webhook%20audio%20upload/music-video",
    ],
    "music-video-advanced": [
      "music-video-advanced",
      "5Tk3cflgLKX1NfDV/webhook%20audio%20upload/music-video-advanced",
    ],
  };

  const getRoutes = {
    "ai-pipeline": "syYYWOyp5uPKBNBQ/webhook/ai-pipeline",
    "flux-transform": "v7XLsJ1csbNGZ2ed/webhook/flux-transform",
    "gpt-processor": "xaz1445WIzCohcSc/webhook/gpt-processor",
    "ai-router": "NTPiqwOq0aR7vh4S/webhook/ai-router",
  };
  async function tryLoadWorkflows() {
    const endpoints = ["/rest/workflows", "/api/v1/workflows"]; // try legacy + alt
    for (const ep of endpoints) {
      try {
        const r = await client.get(ep);
        console.log(ep, "status", r.status);
        if (r.status === 401) continue;
        if (Array.isArray(r.data?.data)) {
          for (const wf of r.data.data) {
            if (!wf.active) continue;
            const id = wf.id;
            for (const node of wf.nodes || []) {
              if (node.type !== "n8n-nodes-base.webhook") continue;
              const p = node.parameters?.path;
              if (!p) continue;
              const composite = `${id}/${encodeURIComponent(node.name)}/${p}`;
              if (!pathMap.has(p)) pathMap.set(p, new Set());
              pathMap.get(p).add(composite);
            }
          }
          return true;
        }
      } catch (e) {
        console.warn("Workflow fetch failed for", ep, e.message);
      }
    }
    return false;
  }
  const got = await tryLoadWorkflows();
  if (!got) {
    console.warn(
      "⚠️  Could not retrieve workflows (401 or empty). Will proceed using only simple webhook paths. Set valid N8N_API_KEY or BASIC auth env and restart n8n to enable composite path discovery."
    );
  }

  function candidatePaths(simple) {
    if (routeOverrides[simple]) return routeOverrides[simple];
    const fulls = Array.from(pathMap.get(simple) || []);
    return [simple, ...fulls.filter((f) => f !== simple)];
  }

  // Audio rotation
  const audioDir =
    process.env.AUDIO_DIR || path.resolve(process.cwd(), "audio");
  let audioFiles = [];
  if (fs.existsSync(audioDir)) {
    audioFiles = fs
      .readdirSync(audioDir)
      .filter((f) => /\.(wav|mp3|m4a|flac)$/i.test(f))
      .map((f) => path.join(audioDir, f));
  }
  let audioIdx = 0;
  function nextAudio() {
    if (!audioFiles.length) return null;
    const f = audioFiles[audioIdx % audioFiles.length];
    audioIdx++;
    return f;
  }

  const results = [];

  function summarize(d) {
    if (d == null) return "<no body>";
    if (typeof d === "string") return d.slice(0, 160);
    try {
      return JSON.stringify(d).slice(0, 160);
    } catch {
      return "[unserializable]";
    }
  }

  async function runMultipart(label, simplePath, fields) {
    const attempts = candidatePaths(simplePath);
    // Expand composite variants for robustness
    const expanded = new Set();
    for (const p of attempts) {
      expanded.add(p);
      if (p.includes("%20")) {
        expanded.add(p.replace(/%20/g, " "));
      }
      const parts = p.split("/");
      if (parts.length >= 3) {
        const [wfId, maybeNode, ...rest] = parts;
        // Omit node segment
        expanded.add([wfId, ...rest].join("/"));
        // Omit workflow id
        expanded.add([maybeNode, ...rest].join("/"));
        // Just final segment
        expanded.add(rest[rest.length - 1]);
        // Normalized variants for node segment starting with 'webhook'
        const decodedNode = decodeURIComponent(maybeNode.toLowerCase());
        if (decodedNode.startsWith("webhook")) {
          const normalized = "webhook";
          // /wfId/webhook/final
          expanded.add([wfId, normalized, ...rest].join("/"));
          // hyphen + condensed variants
          const hyphenated = decodedNode.replace(/\s+/g, "-");
          const condensed = decodedNode.replace(/\s+/g, "");
          expanded.add([wfId, hyphenated, ...rest].join("/"));
          expanded.add([wfId, condensed, ...rest].join("/"));
        }
      }
    }
    const attemptList = [...expanded];
    for (const p of attemptList) {
      for (const b of attemptBases) {
        // fresh form each attempt
        const form = new FormData();
        for (const [k, v] of Object.entries(fields)) {
          if (
            v &&
            typeof v === "object" &&
            Object.prototype.hasOwnProperty.call(v, "__file")
          ) {
            const filePath = v.__file || nextAudio();
            if (filePath && fs.existsSync(filePath))
              form.append(k, fs.createReadStream(filePath));
          } else if (typeof v === "object") form.append(k, JSON.stringify(v));
          else if (v != null) form.append(k, String(v));
        }
        const url = `${b}/webhook/${p}`;
        try {
          const resp = await client.post(url, form, {
            headers: form.getHeaders(),
          });
          if (resp.status === 404) {
            continue; // try next base or next path
          }
          results.push({
            workflow: label,
            path: p,
            status: resp.status,
            ok: resp.status < 400,
            detail: summarize(resp.data),
            note:
              (p !== simplePath ? "full-path" : undefined) ||
              (b === localDirect ? "local" : undefined),
          });
          return;
        } catch (e) {
          // capture socket errors but still try next base or path
          if (/ECONNREFUSED|ENOTFOUND|ECONNRESET/.test(e.message)) {
            continue;
          }
          results.push({
            workflow: label,
            path: p,
            status: "ERR",
            ok: false,
            detail: e.message,
          });
          return;
        }
      }
    }
    results.push({
      workflow: label,
      path: attempts[0] || simplePath,
      status: 404,
      ok: false,
      detail: "All candidate paths 404",
    });
  }

  async function runJson(label, simplePath, body) {
    const attempts = candidatePaths(simplePath);
    const expanded = new Set();
    for (const p of attempts) {
      expanded.add(p);
      if (p.includes("%20")) expanded.add(p.replace(/%20/g, " "));
      const parts = p.split("/");
      if (parts.length >= 3) {
        const [wfId, maybeNode, ...rest] = parts;
        expanded.add([wfId, ...rest].join("/"));
        expanded.add([maybeNode, ...rest].join("/"));
        expanded.add(rest[rest.length - 1]);
        const decodedNode = decodeURIComponent(maybeNode.toLowerCase());
        if (decodedNode.startsWith("webhook")) {
          const normalized = "webhook";
          expanded.add([wfId, normalized, ...rest].join("/"));
          const hyphenated = decodedNode.replace(/\s+/g, "-");
          const condensed = decodedNode.replace(/\s+/g, "");
          expanded.add([wfId, hyphenated, ...rest].join("/"));
          expanded.add([wfId, condensed, ...rest].join("/"));
        }
      }
    }
    const attemptList = [...expanded];
    for (const p of attemptList) {
      for (const b of attemptBases) {
        const url = `${b}/webhook/${p}`;
        try {
          const resp = await client.post(url, body, {
            headers: { "Content-Type": "application/json" },
          });
          if (resp.status === 404) continue; // try next
          results.push({
            workflow: label,
            path: p,
            status: resp.status,
            ok: resp.status < 400,
            detail: summarize(resp.data),
            note:
              (p !== simplePath ? "full-path" : undefined) ||
              (b === localDirect ? "local" : undefined),
          });
          return;
        } catch (e) {
          if (/ECONNREFUSED|ENOTFOUND|ECONNRESET/.test(e.message)) continue;
          results.push({
            workflow: label,
            path: p,
            status: "ERR",
            ok: false,
            detail: e.message,
          });
          return;
        }
      }
    }
    results.push({
      workflow: label,
      path: attempts[0] || simplePath,
      status: 404,
      ok: false,
      detail: "All candidate paths 404",
    });
  }

  // Execute tests
  // GET routes first (optional informational)
  for (const [label, p] of Object.entries(getRoutes)) {
    const urlAttempts = attemptBases.map((b) => `${b}/webhook/${p}`);
    let got = false;
    for (const u of urlAttempts) {
      try {
        const r = await client.get(u);
        if (r.status !== 404) {
          results.push({
            workflow: `GET-${label}`,
            path: p,
            status: r.status,
            ok: r.status < 400,
            detail: summarize(r.data),
          });
          got = true;
          break;
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!got)
      results.push({
        workflow: `GET-${label}`,
        path: p,
        status: 404,
        ok: false,
        detail: "Not Found",
      });
  }
  await runMultipart("WF6", "audio-transcribe", {
    audio: { __file: nextAudio() },
  });
  await runJson("WF7", "qwen-embed", { text: "hello world vector test" });
  await runJson("WF8", "retry-task", { seed: Date.now() });
  await runMultipart("WF9", "multi-modal", {
    audio: { __file: nextAudio() },
    prompt: "Describe ambience",
  });
  await runJson("WF10-ingest", "qdrant-rag", {
    action: "ingest",
    text: "n8n makes automation easy",
  });
  await runJson("WF10-query", "qdrant-rag", {
    action: "query",
    question: "What does n8n do?",
  });
  await runMultipart("WF11", "music-video", { audio: { __file: nextAudio() } });
  await runMultipart("WF12", "music-video-advanced", {
    audio: { __file: nextAudio() },
  });

  console.table(
    results.map((r) => ({
      workflow: r.workflow,
      path: r.path,
      status: r.status,
      ok: r.ok,
      detail: r.detail,
    }))
  );
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error("\nFailures:", failed.length);
    for (const f of failed)
      console.error(` - ${f.workflow} (${f.path}): ${f.status} ${f.detail}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("Test harness fatal error", e);
  process.exitCode = 1;
});
