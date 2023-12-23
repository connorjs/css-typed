import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, parse as parsePath, relative } from "node:path";

import { parse as parseCss, walk } from "css-tree";

/* globals process -- Node/CLI tool */

export async function generateDeclaration(path, time) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(path)) return;

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

	return ts;
}

export function dtsPath(path) {
	const { dir, name, ext } = parsePath(path);
	return join(dir, `${name}.d${ext}.ts`);
}
