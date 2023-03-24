#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, parse as parsePath } from "node:path";

import { parse as parseCss, walk } from "css-tree";
import { glob } from "glob";

await main(process.argv[2]);

async function main(pattern) {
	if (!pattern) {
		console.error(`Expected glob pattern`);
		process.exit(2);
	}

	const files = await glob(pattern);

	const time = new Date().toISOString();
	const results = await Promise.all(
		files.map((file) => generateDeclaration(file, time)),
	);

	const errors = results.filter(Boolean);
	if (errors.length > 0) {
		console.error(`Errors encountered`, errors);
		process.exit(3);
	}

	process.exit(0);
}

async function generateDeclaration(path, time) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(path)) return;

	const css = await readFile(path, `utf8`);

	let ts = `// Generated from ${path} by css-typed at ${time}\n\n`;

	const ast = parseCss(css, { filename: path });
	walk(ast, (node) => {
		if (node.type === `ClassSelector`) {
			ts += `export const ${node.name}: string;\n`;
		}
	});

	await writeFile(dtsPath(path), ts, `utf8`);
	return undefined;
}

function dtsPath(path) {
	const { dir, name, ext } = parsePath(path);
	return join(dir, `${name}.d${ext}.ts`);
}
