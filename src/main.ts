#!/usr/bin/env node

import { createCssTypedCommand } from "./cli/command-utils.ts";
import { generate } from "./commands/generate.ts";
import { version } from "./version.ts";

await createCssTypedCommand()
	.name(`css-typed`)
	.description(
		`TypeScript declaration generator for CSS files (and other stylesheets).\n\nRuns \`generate\` when no subcommand given.`,
	)
	.version(version)
	.cssTypedAction(generate)
	.helpCommand(`help [command]`, `Displays help for the given command.`)
	.addCommand(
		createCssTypedCommand()
			.name(`gen`)
			.alias(`generate`)
			.description(`Generates TypeScript declaration files.`)
			.cssTypedAction(generate),
	)
	.parseAsync();
