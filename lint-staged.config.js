export default {
	"*.{cjs,js,json,ts}": [`prettier -w`, `eslint -f pretty --fix`],
	"*.{css,md,yaml,yml}": `prettier -w`,
};
