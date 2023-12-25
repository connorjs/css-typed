import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, parse as parsePath, relative } from "node:path";

import { parse as parseCss, walk } from "css-tree";

/* globals process -- Node/CLI tool */

/**
 * Generates TypeScript declaration file for the stylesheet file at the given
 * `path`. Includes the given `time` in the generated comment.
 *
 * @param path {string} - Path to stylesheet file.
 * @param time {string} - Timestamp string to include in generated comment.
 * @returns {Promise<string | undefined>} TypeScript declaration file content or
 *   `undefined` if no declarations to write.
 */
export async function generateDeclaration(path, time) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(path)) return undefined;

	const css = await readFile(path, `utf8`);

	const pathRelativeToCwd = relative(process.cwd(), path);

	let ts = `// Generated from \`${pathRelativeToCwd}\` by css-typed at ${time}\n\n`;

	const ast = parseCss(css, { filename: path });
	const exportedNames = new Set();
	walk(ast, (node) => {
		if (node.type === `ClassSelector`) {
			// Skip duplicate names
			if (exportedNames.has(node.name)) return;

			ts += `export const ${node.name}: string;\n`;
			exportedNames.add(node.name);
		}
	});

	// Only return TypeScript if we wrote something
	return exportedNames.size === 0 ? undefined : ts;
}

export function dtsPath(path) {
	const { dir, name, ext } = parsePath(path);
	return join(dir, `${name}.d${ext}.ts`);
}
