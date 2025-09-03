#!/usr/bin/env ts-node
/**
 * Batch import & activate workflow templates (6-10).
 * Reads JSON files from ./workflows, strips placeholder credential IDs, creates or updates
 * workflows by name, and (optionally) activates those with webhooks after successful creation.
 *
 * Usage:
 *   ts-node scripts/import-workflows.ts --activate
 *   node build/scripts/import-workflows.js --activate
 */
import fs from "fs";
import path from "path";
// Try loading from src (dev) then fallback to build (post-compile)
let loadEnvironmentVariables: any, getEnvConfig: any, createApiClient: any;
try {
  ({ loadEnvironmentVariables, getEnvConfig } = await import(
    "../src/config/environment.js"
  ));
  ({ createApiClient } = await import("../src/api/client.js"));
} catch {
  ({ loadEnvironmentVariables, getEnvConfig } = await import(
    "../build/config/environment.js"
  ));
  ({ createApiClient } = await import("../build/api/client.js"));
}

interface TemplateSummary {
  name: string;
  file: string;
  created?: string;
  updated?: string;
  activated?: boolean;
  error?: string;
}

async function main() {
  const doActivate = process.argv.includes("--activate");
  loadEnvironmentVariables();
  const config = getEnvConfig();
  const client = createApiClient(config);

  console.log("[import] Connecting to n8n...");
  await client.checkConnectivity();
  const existing = await client.getWorkflows();
  const byName: Record<string, any> = Object.fromEntries(
    existing.map((w) => [w.name, w])
  );

  const workflowDir = path.resolve(process.cwd(), "workflows");
  const targetFiles = [
    "workflow6_audio_transcription_whisper.json",
    "workflow7_qwen_embeddings_vector_search.json",
    "workflow8_advanced_error_retry.json",
    "workflow9_multimodal_processing.json",
    "workflow10_rag_qdrant.json",
  ];

  const results: TemplateSummary[] = [];

  for (const file of targetFiles) {
    const full = path.join(workflowDir, file);
    if (!fs.existsSync(full)) {
      results.push({ name: "UNKNOWN", file, error: "File missing" });
      continue;
    }
    try {
      const raw = fs.readFileSync(full, "utf-8");
      const json = JSON.parse(raw);
      const name: string = json.name;
      // Sanitize: remove placeholder credential IDs so API accepts; keep credential structure if real id present.
      if (Array.isArray(json.nodes)) {
        for (const n of json.nodes) {
          if (n.credentials) {
            for (const credKey of Object.keys(n.credentials)) {
              const cred = n.credentials[credKey];
              if (cred?.id && cred.id.startsWith("__REPLACE_")) {
                delete cred.id; // allow n8n to resolve by name or skip
              }
              if (cred?.name && cred.name.includes("OpenAi") && !cred.id) {
                // leave name only
              }
            }
          }
        }
      }
      // Remove tags; activation handled separately.
      delete json.tags;
      const existingWf = byName[name];
      if (existingWf) {
        const updated = await client.updateWorkflow(existingWf.id, {
          name: json.name,
          nodes: json.nodes,
          connections: json.connections,
          settings: json.settings || {},
          staticData: json.staticData || null,
        });
        results.push({ name, file, updated: updated.id });
        if (doActivate) {
          try {
            await client.activateWorkflow(updated.id);
            results[results.length - 1].activated = true;
          } catch (e) {
            results[results.length - 1].error =
              "Activate failed: " + (e as Error).message;
          }
        }
      } else {
        const created = await client.createWorkflow(json);
        results.push({ name, file, created: created.id });
        if (doActivate) {
          try {
            await client.activateWorkflow(created.id);
            results[results.length - 1].activated = true;
          } catch (e) {
            results[results.length - 1].error =
              "Activate failed: " + (e as Error).message;
          }
        }
      }
    } catch (err: any) {
      results.push({ name: "UNKNOWN", file, error: err.message });
    }
  }

  console.table(
    results.map((r) => ({
      workflow: r.name,
      file: r.file,
      created: r.created || "",
      updated: r.updated || "",
      activated: r.activated ? "yes" : "",
      error: r.error || "",
    }))
  );

  const failures = results.filter((r) => r.error);
  if (failures.length) {
    process.exitCode = 1;
    console.error("[import] Completed with errors.");
  } else {
    console.log("[import] Success.");
  }
}

main().catch((e) => {
  console.error("[import] Fatal:", e);
  process.exit(1);
});
