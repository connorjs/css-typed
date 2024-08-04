import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Options } from "../options.ts";
import { dtsPath, generateDeclaration } from "./generate-logic.ts";

export async function generate(files: string[], options: Options) {
	const time = new Date().toISOString();
	await Promise.all(
		files.map((file) =>
			generateDeclaration(file, time, options).then((ts) =>
				writeDeclarationFile(file, options.outdir, ts),
			),
		),
	);
}

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
