# Workflow Templates 6-11

These JSON templates correspond to the extended batch of workflows. They can be imported via the automated importer script or the MCP `create_workflow` tool.

## Overview

| #   | File                                            | Purpose                                                         | Trigger Path                    |
| --- | ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| 6   | `workflow6_audio_transcription_whisper.json`    | Accept audio upload -> Whisper transcription -> return text     | `/webhook/audio-transcribe`     |
| 7   | `workflow7_qwen_embeddings_vector_search.json`  | Generate embeddings with Qwen API -> store & retrieve in-memory | `/webhook/qwen-embed`           |
| 8   | `workflow8_advanced_error_retry.json`           | Demonstrate retry with incremental backoff and branching        | `/webhook/retry-task`           |
| 9   | `workflow9_multimodal_processing.json`          | Multi-modal pipeline: audio, image, text -> aggregated output   | `/webhook/multi-modal`          |
| 10  | `workflow10_rag_qdrant.json`                    | RAG pattern with Qdrant (HTTP API) for ingest & query           | `/webhook/qdrant-rag`           |
| 11  | `workflow11_audio_to_music_video.json`          | Audio -> transcription -> cover image -> external video build   | `/webhook/music-video`          |
| 12  | `workflow12_audio_to_music_video_advanced.json` | Multi-scene images, looping & job polling for final video       | `/webhook/music-video-advanced` |

> Note: External credentials (`OpenAI`, `Qwen`, `Qdrant`) must be inserted (replace placeholder IDs). For Qwen, create an HTTP Header Auth credential using `Authorization: Bearer <API_KEY>`. For Qdrant, include header `api-key: <QDRANT_API_KEY>`.

## MCP Creation Example (pseudo)

Example for WF6:

```jsonc
create_workflow {
  name: "WF6: Audio Transcription (Whisper)",
  nodes: [...],
  connections: {...},
  active: false
}
```

## Testing via Webhook

1. Activate a workflow if needed (or use `run_webhook` tool if your instance allows executing inactive dev webhooks).
2. Send POST multipart/form-data with an audio file field matching the node's expected `binaryPropertyName` (`data` for WF6, `audio` for WF9). Example:

```bash
curl -u "$N8N_WEBHOOK_USERNAME:$N8N_WEBHOOK_PASSWORD" -F "data=@sample.wav" https://<n8n-host>/webhook/audio-transcribe
```

## Qdrant Notes

The template uses 1536-d vectors (OpenAI `text-embedding-3-small`). Adjust `size` if you change models.

## Next Steps

1. Replace credential placeholder IDs (OpenAI, Qwen, Qdrant, Video Service, OpenAI HTTP for images).
2. Use MCP `create_workflow` (or run importer) to register each.
3. Provide an external video assembly endpoint (FFmpeg microservice) responding with `{ job_id, video_url }`.
4. Run end-to-end tests with sample payloads; capture outputs for the Integration Report.

### Video Assembly Service (Placeholder)

The workflow assumes an authenticated POST `https://__VIDEO_ASSEMBLY_HOST__/api/v1/build` accepting JSON `{ transcript, image_base64 }` plus audio binary available in the original webhook item. Adapt as needed: you may expose an endpoint that also accepts multipart with the audio file re-uploaded; in that case insert an additional HTTP Request node wired from the original webhook with `binaryData: true` to send the audio.

For richer videos (multiple scene images + waveform), extend by:

1. Adding a Code node to segment transcript into timed scenes.
2. Using a Split In Batches node to iterate scenes and generate images (image prompt per scene).
3. Aggregating images (Item Lists / Merge) and sending an ordered list to the video assembly service.
4. Polling job status (Loop with Wait) until ready, then returning the final `video_url`.
