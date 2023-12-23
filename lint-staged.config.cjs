module.exports = {
	"*.md": `prettier -w`,
	"*.{cjs,js,json}": [`prettier -w`, `eslint -f pretty --fix`],
};
