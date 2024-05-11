import connorjsConfig from "eslint-config-connorjs";

export default [
	...connorjsConfig,
	{
		// Ignore declaration files for ESLint because this package does not have TypeScript
		ignores: [`**/*.d.css.ts`],
	},
];
