import connorjsConfig from "eslint-config-connorjs";

export default [
	...connorjsConfig,
	{
		// Ignore declaration files used for tests. These represent generated files.
		ignores: [`src/fixtures/**/*.d.css.ts`],
	},
];
