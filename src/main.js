#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { glob } from "glob";

import { dtsPath, generateDeclaration } from "./logic.js";

/* globals process -- Node/CLI tool */
await main(process.argv[2], process.argv[3] === `--dashes`);
// See https://github.com/connorjs/css-typed/issues/5 for "proper" CLI arg handling

async function main(pattern, dashesEnabled) {
	if (!pattern) {
		console.error(`Expected glob pattern`);
		process.exit(2);
	}
	const options = dashesEnabled ? { localsConvention: `dashes` } : {};

	const files = await glob(pattern);

	const time = new Date().toISOString();
	const results = await Promise.all(
		files.map((file) =>
			generateDeclaration(file, time, options).then((ts) =>
				writeDeclarationFile(file, ts),
			),
		),
	);

	const errors = results.filter(Boolean);
	if (errors.length > 0) {
		console.error(`Errors encountered`, errors);
		process.exit(3);
	}

	process.exit(0);
}

async function writeDeclarationFile(path, ts) {
	await writeFile(dtsPath(path), ts, `utf8`);
	return undefined;
}
