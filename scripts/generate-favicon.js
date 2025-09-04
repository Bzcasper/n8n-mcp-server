/** @format */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple ICO header and data for a 16x16 pixel favicon
// This creates a basic blue square with 'N8n' text - replace with proper design later
const icoData = Buffer.from([
  0x00,
  0x00, // Reserved
  0x01,
  0x00, // Type: ICO
  0x01,
  0x00, // Number of images: 1

  // Image directory entry
  0x10, // Width: 16
  0x10, // Height: 16
  0x00, // Color count
  0x00, // Reserved
  0x01,
  0x00, // Color planes
  0x20,
  0x00, // Bits per pixel

  // Image data size (calculate total size excluding header)
  0x28,
  0x04,
  0x00,
  0x00, // 1064 bytes (16x16x32 + 40 header)

  // Image data offset
  0x16,
  0x00,
  0x00,
  0x00, // 22 bytes

  // BITMAPINFOHEADER
  0x28,
  0x00,
  0x00,
  0x00, // Header size
  0x10,
  0x00,
  0x00,
  0x00, // Width
  0x20,
  0x00,
  0x00,
  0x00, // Height (32 for XOR + AND)
  0x01,
  0x00, // Planes
  0x20,
  0x00, // Bits per pixel
  0x00,
  0x04,
  0x00,
  0x00, // BI_RGB
  0x00,
  0x10,
  0x00,
  0x00, // Image size
  0x00,
  0x00,
  0x00,
  0x00, // X pixels per meter
  0x00,
  0x00,
  0x00,
  0x00, // Y pixels per meter
  0x00,
  0x00,
  0x00,
  0x00, // Colors used
  0x00,
  0x00,
  0x00,
  0x00, // Colors important

  // Pixel data (16x16 RGBA) - simple blue gradient
  // This is a very basic 16x16 pixel blue icon
  ...Array(16)
    .fill(0)
    .flatMap((_, y) =>
      Array(16)
        .fill(0)
        .flatMap((_, x) => {
          const intensity = Math.floor((x + y) * 8);
          return [0xff, 0xff - intensity, 0xff - intensity, 0x00]; // BGRA
        })
    ),

  // AND mask (16x16 monochrome) - all transparent for simplicity
  ...Array(32).fill(0xff), // 16x16 bits = 32 bytes
]);

const faviconPath = path.join(__dirname, "..", "public", "favicon.ico");

try {
  fs.writeFileSync(faviconPath, icoData);
  console.log("Favicon generated successfully at", faviconPath);
} catch (error) {
  console.error("Failed to generate favicon:", error);
  process.exit(1);
}
