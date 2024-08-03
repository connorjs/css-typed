import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseCss, walk } from "css-tree";
import camelCase from "lodash.camelcase";

import type { LocalsConvention, Options } from "./options.ts";

/**
 * Generates TypeScript declaration file for the stylesheet file at the given
 * `path`. Includes the given `time` in the generated comment.
 *
 * @param stylesheetPath - Path to stylesheet file.
 * @param time - Timestamp string to include in generated comment.
 * @param options - Options object.
 * @returns TypeScript declaration file content or `undefined` if no declarations to write.
 */
export async function generateDeclaration(
	stylesheetPath: string,
	time: string,
	options: Options = {},
) {
	// Handle case where the file got deleted by the time we got here
	if (!existsSync(stylesheetPath)) {
		return undefined;
	}

	const css = await readFile(stylesheetPath, `utf8`);

	const ast = parseCss(css, { filename: stylesheetPath });
	const visitedNames = new Set<string>();
	const exportedNames = new Map<string, string | undefined>();
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
	stylesheetPath: string,
	time: string,
	exportedNames: Map<string, string | undefined>,
	hasAtLeastOneInvalidTsExportName: boolean,
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
 * @param localsConvention - Style of exported class names.
 * @return Names to write. (Could return the original and modified name.)
 */
function handleLocalsConvention(
	name: string,
	localsConvention: LocalsConvention | undefined,
): [string] | [string, string] {
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

function hasDashes(s: string) {
	return s.includes(`-`);
}

// Modifies postcss-modules `dashesCamelCase` function to use `replaceAll` given
// https://github.com/madyankin/postcss-modules/blob/master/src/localsConvention.js
// https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md
function dashesCamelCase(s: string) {
	return s.replaceAll(/-+(\w)/g, (_, firstLetter: string) =>
		firstLetter.toUpperCase(),
	);
}

export function dtsPath(stylesheetPath: string, outdir: string | undefined) {
	const { dir: originalDirectory, name, ext } = path.parse(stylesheetPath);

	let directory;
	if (outdir) {
		const relative = path.relative(process.cwd(), originalDirectory);
		directory = path.join(outdir, relative);
	} else {
		directory = originalDirectory;
	}

	return path.join(path.resolve(directory), `${name}.d${ext}.ts`);
}
