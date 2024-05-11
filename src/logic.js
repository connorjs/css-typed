import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseCss, walk } from "css-tree";

/* globals process -- Node/CLI tool */

/**
 * Generates TypeScript declaration file for the stylesheet file at the given
 * `path`. Includes the given `time` in the generated comment.
 *
 * @param stylesheetPath {string} - Path to stylesheet file.
 * @param time {string} - Timestamp string to include in generated comment.
 * @param options {{localsConvention?: "dashes"}} - Options object.
 * @returns {Promise<string | undefined>} TypeScript declaration file content or
 *   `undefined` if no declarations to write.
 */
export async function generateDeclaration(stylesheetPath, time, options) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(stylesheetPath)) return undefined;

	const css = await readFile(stylesheetPath, `utf8`);

	const pathRelativeToCwd = path.relative(process.cwd(), stylesheetPath);

	let ts = `// Generated from \`${pathRelativeToCwd}\` by css-typed at ${time}\n\n`;

	const ast = parseCss(css, { filename: stylesheetPath });
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

	// Only return TypeScript if we wrote something
	return exportedNames.size === 0 ? undefined : ts;
}

function hasDashes(/*string*/ s) {
	return s.includes(`-`);
}

// Modifies postcss-modules `dashesCamelCase` function to use `replaceAll` given
// https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md
function dashesCamelCase(/*string*/ s) {
	return s.replaceAll(/-+(\w)/g, (_, firstLetter) => firstLetter.toUpperCase());
}

export function dtsPath(/*string*/ stylesheetPath) {
	const { dir, name, ext } = path.parse(stylesheetPath);
	return path.join(dir, `${name}.d${ext}.ts`);
}
