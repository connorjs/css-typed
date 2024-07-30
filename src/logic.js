import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseCss, walk } from "css-tree";
import camelCase from "lodash.camelcase";

/* globals process -- Node/CLI tool */

/**
 * Generates TypeScript declaration file for the stylesheet file at the given
 * `path`. Includes the given `time` in the generated comment.
 *
 * @param stylesheetPath {string} - Path to stylesheet file.
 * @param time {string} - Timestamp string to include in generated comment.
 * @param options {{localsConvention: "camelCase"|"camelCaseOnly"|"dashes"|"dashesOnly"|"none"}} - Options object.
 * @returns {Promise<string | undefined>} TypeScript declaration file content or
 *   `undefined` if no declarations to write.
 */
export async function generateDeclaration(stylesheetPath, time, options = {}) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(stylesheetPath)) return undefined;

	const css = await readFile(stylesheetPath, `utf8`);

	const ast = parseCss(css, { filename: stylesheetPath });
	const visitedNames = new Set();
	const exportedNames = new Map();
	let hasAtLeastOneInvalidTsExportName = false;
	walk(ast, (node) => {
		if (node.type === `ClassSelector`) {
			// Skip duplicate names
			if (visitedNames.has(node.name)) return;

			const namesToExport = handleLocalsConvention(
				node.name,
				options.localsConvention,
			);

			for (const name of namesToExport) {
				// Note: This may need improvement (e.g. number at start).
				const isInvalidName = hasDashes(name);
				if (isInvalidName) {
					hasAtLeastOneInvalidTsExportName = true;
				}

				// Write valid TS
				const validTsName = isInvalidName
					? // eslint-disable-next-line quotes -- No nested template
						`_${name.replaceAll(/-+/g, "")}`
					: name;

				// Save exports for final TS export. `undefined` means key is valid (used lower).
				exportedNames.set(name, isInvalidName ? validTsName : undefined);
			}
			visitedNames.add(node.name);
		}
	});

	// Only return TypeScript if we wrote something
	if (visitedNames.size === 0) {
		return undefined;
	}

	return printTypeScriptDeclarationFile(
		stylesheetPath,
		time,
		exportedNames,
		hasAtLeastOneInvalidTsExportName,
	);
}

function printTypeScriptDeclarationFile(
	stylesheetPath,
	time,
	exportedNames,
	hasAtLeastOneInvalidTsExportName,
) {
	const pathRelativeToCwd = path.relative(process.cwd(), stylesheetPath);

	let ts = `// Generated from \`${pathRelativeToCwd}\` by css-typed at ${time}\n\n`;

	if (hasAtLeastOneInvalidTsExportName) {
		// We have at least one invalid TS export name, so we use `export = { ... }` syntax.
		// For example, we could have `export { fooBar, "foo-bar": _fooBar }`.

		// First, print all consts
		for (const [name, validTsName] of exportedNames) {
			ts += `const ${validTsName ?? name}: string;\n`;
		}

		// Second, print export
		ts += `\nexport = {\n`;
		for (const [name, validTsName] of exportedNames) {
			const line = validTsName ? `"${name}": ${validTsName}` : name;
			ts += `\t${line},\n`;
		}
		ts += `};\n`;
	} else {
		// No invalid TS, so we use the simple `export const foo: string;` syntax
		// This implies that all values are undefined, so we only use keys
		for (const name of exportedNames.keys()) {
			ts += `export const ${name}: string;\n`;
		}
	}
	return ts;
}

/**
 * Handles renaming class names with `localsConvention` option.
 *
 * @param name {string} - Class name.
 * @param localsConvention {"camelCase"|"camelCaseOnly"|"dashes"|"dashesOnly"|"none"} - Style of exported class names.
 * @return {string[]} - Names to write. (Could return the original and modified name.)
 */
function handleLocalsConvention(name, localsConvention) {
	switch (localsConvention) {
		case `camelCase`: {
			return [name, camelCase(name)];
		}
		case `camelCaseOnly`: {
			return [camelCase(name)];
		}
		case `dashes`: {
			return [name, dashesCamelCase(name)];
		}
		case `dashesOnly`: {
			return [dashesCamelCase(name)];
		}
		default: {
			return [name];
		}
	}
}

function hasDashes(/*string*/ s) {
	return s.includes(`-`);
}

// Modifies postcss-modules `dashesCamelCase` function to use `replaceAll` given
// https://github.com/madyankin/postcss-modules/blob/master/src/localsConvention.js
// https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md
function dashesCamelCase(/*string*/ s) {
	return s.replaceAll(/-+(\w)/g, (_, firstLetter) => firstLetter.toUpperCase());
}

export function dtsPath(/*string*/ stylesheetPath) {
	const { dir, name, ext } = path.parse(stylesheetPath);
	return path.join(dir, `${name}.d${ext}.ts`);
}
