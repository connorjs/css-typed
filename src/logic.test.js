import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { dtsPath, generateDeclaration } from "./logic.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(`css-typed`, () => {
	describe.each([
		[`foo.css`, `foo.d.css.ts`, {}],
		[`foo.module.css`, `foo.module.d.css.ts`, {}],
		[`kebab-case/kebab-case.css`, `kebab-case/kebab-case-default.d.css.ts`, {}],
		[
			`kebab-case/kebab-case.css`,
			`kebab-case/kebab-case-dashes.d.css.ts`,
			{ localsConvention: `dashes` },
		],
	])(`%s → %s`, (inputFilename, outputFilename, options) => {
		it(`should match expected output`, async () => {
			const inputPath = join(__dirname, `fixtures`, inputFilename);
			const outputPath = join(__dirname, `fixtures`, outputFilename);

			const expected = readFileSync(outputPath, { encoding: `utf8` });

			const generated = await generateDeclaration(inputPath, `$TIME`, options);
			expect(generated).toStrictEqual(expected);
		});
	});

	describe(`dtsPath`, () => {
		it.each([
			[`foo.css`, `foo.d.css.ts`],
			[`foo.module.css`, `foo.module.d.css.ts`],
		])(`%s should create file %s`, (input, expected) => {
			expect(dtsPath(input)).toStrictEqual(expected);
		});
	});
});
