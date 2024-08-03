import { load } from "js-yaml";
import type { LilconfigResult, Loaders } from "lilconfig";
import { lilconfig } from "lilconfig";
import type { OverrideProperties } from "type-fest";

import type { Options } from "./options.ts";

const name = `css-typed`;
const rcAlt = `csstyped`;

/**
 * Places to search for the config.
 *
 * The history of the values follow.
 *
 * 1. Start with [lilconfig default array][a] allowing mjs (async).
 *
 * 2. Add extensionless rc at the root (matches cosmiconfig).
 *
 * 3. Change to use two naming conventions.
 *    1. package prop and config files use `css-typed` (with hyphen, match the module name).
 *    2. RC files use `csstyped` (no hyphen) because `.css-typedrc` feels wrong compared to `.csstypedrc`.
 *       This matches the convention `lint-staged` uses: `lint-staged.config.js` and `.lintstagedrc`.
 *
 * 4. Add YAML files, preferring `.yaml` over `.yml` (following the [YAML FAQ][b] guidance and matching cosmiconfig).
 *    css-typed supports parsing YAML via the `js-yaml` package.
 *    Check YAML after JSON values (matches cosmiconfig).
 *    Include `package.yaml`.
 *
 * [a]: https://github.com/antonk52/lilconfig/blob/2cb3e756e1e1d890caee88d3f44a898c7903b2a2/src/index.js#L10-L24
 * [b]: https://yaml.org/faq.html
 */
// Default lilconfig search places, modified for no hyphen in rc case
const searchPlaces = [
	`package.json`,
	`package.yaml`,
	`.${rcAlt}rc`,
	`.${rcAlt}rc.json`,
	`.${rcAlt}rc.yaml`,
	`.${rcAlt}rc.yml`,
	`.${rcAlt}rc.js`,
	`.${rcAlt}rc.cjs`,
	`.${rcAlt}rc.mjs`,
	`.config/${rcAlt}rc`,
	`.config/${rcAlt}rc.json`,
	`.config/${rcAlt}rc.yaml`,
	`.config/${rcAlt}rc.yml`,
	`.config/${rcAlt}rc.js`,
	`.config/${rcAlt}rc.cjs`,
	`.config/${rcAlt}rc.mjs`,
	`${name}.config.js`,
	`${name}.config.cjs`,
	`${name}.config.mjs`,
];

const loaders: Loaders = {
	".yaml": loadYaml,
	".yml": loadYaml,
	noExt: loadYaml,
};

const configSearcher = lilconfig(name, { loaders, searchPlaces });

/** Loads the css-typed configuration file. */
export async function loadFileConfig(configPath: string | undefined) {
	return (await (configPath
		? configSearcher.load(configPath)
		: configSearcher.search())) as CssTypedConfig | null;
}

type CssTypedConfig = OverrideProperties<
	NonNullable<LilconfigResult>,
	{ config: { pattern?: string } & Options }
>;

function loadYaml(filename: string, content: string) {
	return load(content, { filename });
}
