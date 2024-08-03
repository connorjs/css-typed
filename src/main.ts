#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Command, Option } from "@commander-js/extra-typings";
import { glob } from "glob";

import { loadFileConfig } from "./config.ts";
import { dtsPath, generateDeclaration } from "./logic.js";
import type { Options } from "./options.ts";
import { localsConventionChoices } from "./options.ts";

declare let VERSION: string; // Defined by esbuild
const version = VERSION;

await new Command()
	.name(`css-typed`)
	.description(`TypeScript declaration generator for CSS files.`)
	.version(version)
	.argument(`[pattern]`, `Glob path for CSS files to target.`)
	.option(`-c, --config <configFile>`, `Custom path to the configuration file.`)
	.addOption(
		new Option(
			`--localsConvention <localsConvention>`,
			`Style of exported classnames. See https://github.com/connorjs/css-typed/tree/v${version}#localsConvention`,
		)
			.choices(localsConventionChoices)
			.default(`dashesOnly` as const),
	)
	.option(
		`-o, --outdir <outDirectory>`,
		`Root directory for generated CSS declaration files.`,
	)
	.action(async function (
		cliPattern,
		{ config: cliConfig, ...cliOptions },
		program,
	) {
		// Load file configuration first
		const configResult = await loadFileConfig(cliConfig);
		if (configResult?.config) {
			console.debug(`Reading configuration from ${configResult.filepath}.`);
		} else if (cliConfig) {
			program.error(`Failed to parse ${cliConfig}.`);
		}

		// Remove pattern argument from file config, if present.
		const { pattern: filePattern, ...fileConfig } = configResult?.config ?? {};

		// Resolve options from file config and CLI. CLI overrides file config.
		const options: Options = { ...fileConfig, ...cliOptions };

		// Pattern is required. CLI overrides file config.
		const pattern = cliPattern ?? filePattern;
		if (!pattern) {
			// Match commander error message exactly
			console.error(configResult);
			program.error(`error: missing required argument 'pattern'`);
			return;
		}

		// Find the files and process each.
		const files = await glob(pattern);

		const time = new Date().toISOString();
		await Promise.all(
			files.map((file) =>
				generateDeclaration(file, time, options).then((ts) =>
					writeDeclarationFile(file, options.outdir, ts),
				),
			),
		);
	})
	.parseAsync();

/**
 * Writes the TypeScript declaration content to file. Handles the output path.
 *
 * @param file - Path to the original stylesheet file. NOT the path to write.
 * @param outdir - Output directory to which to write.
 * @param ts - The TypeScript declaration content to write.
 * @returns Empty promise indicating when writing has completed.
 */
async function writeDeclarationFile(
	file: string,
	outdir: string | undefined,
	ts: string | undefined,
) {
	if (!ts) {
		return undefined;
	}

	const [directoryToWrite, fileToWrite] = dtsPath(file, outdir);
	if (!existsSync(directoryToWrite)) {
		await mkdir(directoryToWrite, { recursive: true });
	}

	const pathToWrite = path.join(directoryToWrite, fileToWrite);
	await writeFile(pathToWrite, ts, { encoding: `utf8` });
}
