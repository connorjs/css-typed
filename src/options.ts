export type Options = {
	localsConvention?: LocalsConvention;
};

export type LocalsConvention = (typeof localsConventionChoices)[number];

export const localsConventionChoices = [
	`camelCase`,
	`camelCaseOnly`,
	`dashes`,
	`dashesOnly`,
	`none`,
] as const;
