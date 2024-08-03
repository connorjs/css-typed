import { lilconfig } from "lilconfig";

const name = `css-typed`;
const rcAlt = `csstyped`;

// Default lilconfig search places, modified
const searchPlaces2 = [
	`package.json`,
	`.${name}rc.json`,
	`.${name}rc.js`,
	`.${name}rc.cjs`,
	`.${name}rc.mjs`,
	`.config/${name}rc`,
	`.config/${name}rc.json`,
	`.config/${name}rc.js`,
	`.config/${name}rc.cjs`,
	`.config/${name}rc.mjs`,
	`${name}.config.js`,
	`${name}.config.cjs`,
	`${name}.config.mjs`,
];

async function loadFileConfig() {
	return lilconfig(`css-typed`, { searchPlaces }).search();
}
