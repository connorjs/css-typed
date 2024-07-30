import { readFile } from "node:fs/promises";
import path from "node:path";

import { analyzeMetafile, build } from "esbuild";

const version = JSON.parse(
	await readFile(path.join(import.meta.dirname, `..`, `package.json`), `utf8`),
).version;

const result = await build({
	bundle: true,
	define: {
		[`process.env.NODE_ENV`]: `"production"`,
		VERSION: `"${version}"`,
	},
	entryPoints: [`src/main.js`],
	format: `esm`,
	metafile: true,
	minify: true,
	outdir: `dist`,
	packages: `external`,
	platform: `node`,
	target: `node20`,
});

const analysis = await analyzeMetafile(result.metafile);
console.log(analysis);
