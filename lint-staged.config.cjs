module.exports = {
	"*.{cjs,js,json}": [`prettier -w`, `eslint -f pretty --fix`],
	"*.{md,yaml,yml}": `prettier -w`,
};
