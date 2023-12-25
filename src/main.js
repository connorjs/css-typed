#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { glob } from "glob";

import { dtsPath, generateDeclaration } from "./logic.js";

/* globals process -- Node/CLI tool */
await main(process.argv[2]);

async function main(pattern) {
	if (!pattern) {
		console.error(`Expected glob pattern`);
		process.exit(2);
	}

	const files = await glob(pattern);

	const time = new Date().toISOString();
	const results = await Promise.all(
		files.map((file) =>
			generateDeclaration(file, time).then((ts) =>
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

/**
 * Writes the TypeScript declaration content to file. Handles the output path.
 *
 * @param path {string} - Path to the original stylesheet file. NOT the path to write.
 * @param ts {string | undefined} - The TypeScript declaration content to write.
 * @returns {Promise<undefined>} Empty promise indicating when writing has completed.
 */
async function writeDeclarationFile(path, ts) {
	if (!ts) return undefined;
	await writeFile(dtsPath(path), ts, `utf8`);
	return undefined;
}
