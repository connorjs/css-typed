#!/usr/bin/env node

import { createCssTypedCommand } from "./cli/command-utils.ts";
import { generate } from "./commands/generate.ts";
import { version } from "./version.ts";

await createCssTypedCommand()
	.name(`css-typed`)
	.description(
		`TypeScript declaration generator for CSS files (and other stylesheets).`,
	)
	.version(version)
	.cssTypedAction(generate)
	.parseAsync();
