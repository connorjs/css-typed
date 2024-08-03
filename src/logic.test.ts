import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { dtsPath, generateDeclaration } from "./logic.js";
import type { Options } from "./options.ts";
import { localsConventionChoices } from "./options.ts";

describe(`css-typed`, () => {
	it(`should not generate an empty declaration file [#9]`, async () => {
		const path = fixtureFile(`no-declaration-file.css`);
		expect(await generateDeclaration(path, `$TIME`)).toBeUndefined();
	});

	type Case = readonly [string, string, Options];
	describe.each([
		[`foo.css`, `foo.d.css.ts`, {}],
		[`foo.module.css`, `foo.module.d.css.ts`, {}],
		...localsConventionChoices.map(
			(localsConvention) =>
				[
					`casing/casing.css`,
					`casing/${localsConvention}.d.css.ts`,
					{ localsConvention },
				] satisfies Case,
		),
	] satisfies Case[])(`%s → %s`, (inputFilename, outputFilename, options) => {
		it(`should match expected output`, async () => {
			const inputPath = fixtureFile(inputFilename);
			const outputPath = fixtureFile(outputFilename);

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

function fixtureFile(filename: string) {
	return path.join(import.meta.dirname, `fixtures`, filename);
}
