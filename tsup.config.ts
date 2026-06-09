import { defineConfig } from 'tsup'

/**
 * Bundle the action to a single self-contained ESM file (`dist/index.js`).
 *
 * Because this repo is `"type": "module"`, `.js` is loaded as ESM by Node.
 * Bundled CJS deps (e.g. dotenv's `require('fs')`) would fail in ESM with
 * "Dynamic require of 'fs' is not supported", so the banner injects a real
 * `require` via createRequire — the manual equivalent of bun's __toESM shim
 * (cf. github-stats-enhanced). GitHub Actions' node24 runtime loads this file
 * directly (see action.yml) and does not need node_modules.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  clean: true,
  outExtension: () => ({ js: '.js' }),
  // Provide `require` so bundled CJS deps work inside the ESM bundle.
  banner: {
    js: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);"
  },
  // node_modules isn't committed, so EVERY runtime dep must be inlined into
  // the single output file. tsup externalizes `dependencies` by default;
  // this forces it to bundle them all (self-contained bundle).
  noExternal: [/.*/],
  // Keep the output as a SINGLE file. tsup enables code-splitting for ESM,
  // which (because unpdf uses a dynamic import() for pdfjs) would emit extra
  // `chunk-*.js` / `pdfjs-*.js` files alongside index.js. Disabling splitting
  // makes esbuild inline the dynamic import instead — one self-contained file,
  // like bun's output.
  splitting: false
})
