#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { Command, Option } from "@commander-js/extra-typings";
import { glob } from "glob";

import { dtsPath, generateDeclaration } from "./logic.js";
import { version } from "./version.js";

await new Command()
	.name(`css-typed`)
	.description(`TypeScript declaration generator for CSS files.`)
	.version(version)
	.argument(`<pattern>`, `Glob path for CSS files to target.`)
	.addOption(
		new Option(
			`--localsConvention`,
			`Style of exported classnames. See https://github.com/connorjs/css-typed/tree/v${version}#localsConvention`,
		)
			.choices([`camelCase`, `camelCaseOnly`, `dashes`, `dashesOnly`, `none`])
			.default(`dashesOnly`),
	)
	.action(async function (pattern, options, program) {
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
			program.error(`Errors encountered: ${errors}`);
		}
	})
	.parseAsync();

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
