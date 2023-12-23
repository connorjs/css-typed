import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, parse as parsePath, relative } from "node:path";

import { parse as parseCss, walk } from "css-tree";

/* globals process -- Node/CLI tool */

export async function generateDeclaration(
	/*string*/ path,
	/*string*/ time,
	/*{localsConvention?: "dashes"}*/ options,
) {
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

			// Skip dashed names (kebab-case), unless `localsConvention` is `dashes`.
			const nameHasDashes = hasDashes(node.name);
			if (nameHasDashes && options.localsConvention !== `dashes`) return;

			const nodeName = nameHasDashes ? dashesCamelCase(node.name) : node.name;

			ts += `export const ${nodeName}: string;\n`;
			exportedNames.add(nodeName);
		}
	});

	return ts;
}

function hasDashes(/*string*/ s) {
	return s.includes(`-`);
}

// Modifies postcss-modules `dashesCamelCase` function to use `replaceAll` given
// https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md
function dashesCamelCase(/*string*/ s) {
	return s.replaceAll(/-+(\w)/g, (_, firstLetter) => firstLetter.toUpperCase());
}

export function dtsPath(/*string*/ path) {
	const { dir, name, ext } = parsePath(path);
	return join(dir, `${name}.d${ext}.ts`);
}
