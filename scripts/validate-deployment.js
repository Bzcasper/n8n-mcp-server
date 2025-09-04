#!/usr/bin/env node
/** @format */
/* eslint-env node */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const requiredFiles = [
  "package.json",
  "vercel.json",
  "api/server.ts",
  "src/index.ts",
  "tsconfig.json",
];

const errors = [];
const warnings = [];

console.log("🔍 Validating n8n-mcp-server deployment...\n");

// Check Node.js version
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.split(".")[0].slice(1));
if (nodeMajor < 20) {
  errors.push(
    `Node.js version ${nodeVersion} is too old. Minimum required: 20.0.0`
  );
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check if required files exist
console.log("\n📁 Checking required files...");
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`);
  } else {
    errors.push(`Missing required file: ${file}`);
  }
}

// Check if build directory exists or can be built
console.log("\n🏗️  Checking build configuration...");
try {
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✅ TypeScript compilation check passed");
} catch (err) {
  errors.push("TypeScript compilation failed");
}

// Check vercel.json content
console.log("\n⚙️  Checking vercel.json configuration...");
if (fs.existsSync("vercel.json")) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
    if (!vercelConfig.buildCommand) {
      warnings.push("No buildCommand specified in vercel.json");
    }
    if (!vercelConfig.functions || !vercelConfig.functions["api/server.ts"]) {
      errors.push("Function configuration missing for api/server.ts");
    }
    if (!vercelConfig.headers) {
      warnings.push("No security headers configured in vercel.json");
    }
    console.log("✅ vercel.json configuration valid");
  } catch (err) {
    errors.push("Invalid vercel.json format");
  }
}

// Check package.json engines
console.log("\n📦 Checking package.json...");
try {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (!pkg.engines || !pkg.engines.node) {
    errors.push("engines.node not specified in package.json");
  } else if (pkg.engines.node !== ">=20.0.0") {
    warnings.push("Node.js engine version should be >=20.0.0");
  }
  console.log("✅ package.json valid");
} catch (err) {
  errors.push("Invalid package.json format");
}

// Display results
if (errors.length > 0) {
  console.log("\n❌ DEPLOYMENT VALIDATION FAILED!");
  console.log("\nErrors:");
  errors.forEach((error) => console.log(`  - ${error}`));
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
  process.exit(1);
} else {
  console.log("\n🎉 DEPLOYMENT VALIDATION PASSED!");
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
  console.log("\n🚀 Ready for Vercel deployment!");
}
