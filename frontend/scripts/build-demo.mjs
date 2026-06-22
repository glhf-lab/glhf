// Builds the static, backend-free demo and copies it into the docs site so it
// is served at /glhf/demo/.
//
// `output: export` does not support API routes or middleware, so we temporarily
// move them aside for the build and always restore them afterwards (try/finally).
// Auth and the user profile are handled client-side by the demo shim instead.
import { execSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const frontendDir = join(scriptDir, "..")
const repoRoot = join(frontendDir, "..")

const outDir = join(frontendDir, "out")
const destDir = join(repoRoot, "docs", "static", "demo")
const stashDir = join(frontendDir, ".demo-build-stash")

// Paths (relative to frontendDir) that are unsupported by `output: export`.
const UNSUPPORTED = ["src/middleware.js", "src/pages/api"]

function stash() {
  for (const rel of UNSUPPORTED) {
    const src = join(frontendDir, rel)
    if (!existsSync(src)) continue
    const dest = join(stashDir, rel)
    mkdirSync(dirname(dest), { recursive: true })
    renameSync(src, dest)
  }
}

function unstash() {
  for (const rel of UNSUPPORTED) {
    const src = join(stashDir, rel)
    if (!existsSync(src)) continue
    const dest = join(frontendDir, rel)
    mkdirSync(dirname(dest), { recursive: true })
    renameSync(src, dest)
  }
  rmSync(stashDir, { recursive: true, force: true })
}

rmSync(outDir, { recursive: true, force: true })

stash()
try {
  execSync("yarn build", {
    cwd: frontendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: "true",
      // Empty by default: demo fixtures use absolute URLs only, so no Strapi
      // host leaks into the build. Override to point images at a public CDN.
      NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL || "",
    },
  })
} finally {
  unstash()
}

rmSync(destDir, { recursive: true, force: true })
mkdirSync(dirname(destDir), { recursive: true })
cpSync(outDir, destDir, { recursive: true })

console.log(`\nDemo exported to ${destDir} (served at /glhf/demo/).`)
