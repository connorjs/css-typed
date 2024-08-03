#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { Command, Option } from "@commander-js/extra-typings";
import { glob } from "glob";

import { dtsPath, generateDeclaration } from "./logic.js";
import { localsConventionChoices } from "./options.ts";

declare let VERSION: string; // Defined by esbuild
const version = VERSION;

await new Command()
	.name(`css-typed`)
	.description(`TypeScript declaration generator for CSS files.`)
	.version(version)
	.argument(`<pattern>`, `Glob path for CSS files to target.`)
	.addOption(
		new Option(
			`--localsConvention <localsConvention>`,
			`Style of exported classnames. See https://github.com/connorjs/css-typed/tree/v${version}#localsConvention`,
		)
			.choices(localsConventionChoices)
			.default(`dashesOnly` as const),
	)
	.action(async function (pattern, options) {
		const files = await glob(pattern);

		const time = new Date().toISOString();
		await Promise.all(
			files.map((file) =>
				generateDeclaration(file, time, options).then((ts) =>
					writeDeclarationFile(file, ts),
				),
			),
		);
	})
	.parseAsync();

/**
 * Writes the TypeScript declaration content to file. Handles the output path.
 *
 * @param path - Path to the original stylesheet file. NOT the path to write.
 * @param ts - The TypeScript declaration content to write.
 * @returns Empty promise indicating when writing has completed.
 */
async function writeDeclarationFile(path: string, ts: string | undefined) {
	if (!ts) return undefined;
	await writeFile(dtsPath(path), ts, `utf8`);
	return undefined;
}
