import { default as connorjsConfig } from "eslint-config-connorjs";

const config = [
	...connorjsConfig,
	{
		// Ignore declaration files for ESLint because this package does not have TypeScript
		ignores: [`**/*.d.css.ts`],
	},
];

export default config;
