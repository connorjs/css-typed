import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { dtsPath, generateDeclaration } from "./logic.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(`css-typed`, () => {
	describe.each([`foo.css`, `foo.module.css`])(`%s`, (filename) => {
		it(`should match expected output`, async () => {
			const path = join(__dirname, `fixtures`, filename);
			const expected = readFileSync(dtsPath(path), { encoding: `utf8` });
			expect(await generateDeclaration(path, `$TIME`)).toStrictEqual(expected);
		});
	});
});
