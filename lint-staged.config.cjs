module.exports = {
	"*.{cjs,js,json}": [`prettier -w`, `eslint -f pretty --fix`],
	"*.{css,md,yaml,yml}": `prettier -w`,
};
