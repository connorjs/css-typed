import { Command, Option } from "@commander-js/extra-typings";
import { glob } from "glob";

import type { Options } from "../options.ts";
import { localsConventionChoices } from "../options.ts";
import { version } from "../version.ts";
import { loadFileConfig } from "./config.ts";

// eslint-disable-next-line quotes -- Module must be quotes
declare module "@commander-js/extra-typings" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Extending class
	interface Command {
		cssTypedAction: typeof cssTypedAction;
	}
}

/** Creates css-typed command with global options. */
export function createCssTypedCommand() {
	const command = new Command()
		.argument(`[pattern]`, `Glob path for CSS files to target.`)
		.option(`-c, --config <file>`, `Custom path to the configuration file.`)
		.addOption(
			new Option(
				`--localsConvention <value>`,
				`Style of exported classnames. See https://github.com/connorjs/css-typed/tree/v${version}#localsConvention`,
			)
				.choices(localsConventionChoices)
				.default(`dashesOnly` as const),
		)
		.option(
			`-o, --outdir <outDirectory>`,
			`Root directory for generated CSS declaration files.`,
		);
	command.cssTypedAction = cssTypedAction.bind(command);
	return command;
}

/** Standardizes global option handling and simplifies action interface. */
function cssTypedAction(
	this: Command<[string | undefined], Partial<Options> & { config?: string }>,
	fileHandler: (files: string[], options: Options) => Promise<void>,
) {
	return this.action(
		async (cliPattern, { config: cliConfigPath, ...cliOptions }, program) => {
			// Load file configuration first
			const configResult = await loadFileConfig(cliConfigPath);
			if (configResult?.filepath) {
				// We loaded the file
				console.debug(
					`[debug] Reading configuration from ${configResult.filepath}.`,
				);
			} else if (cliConfigPath) {
				// We did not load the file, but we expected to with `-c/--config`, so error
				return program.error(`[error] Failed to parse ${cliConfigPath}.`);
			}

			// Remove pattern argument from file config, if present.
			const { pattern: filePattern, ...fileConfig } =
				configResult?.config ?? {};

			// Resolve options from file config and CLI. CLI overrides file config.
			const options: Options = { ...fileConfig, ...cliOptions };

			// Pattern is required. CLI overrides file config.
			const pattern = cliPattern ?? filePattern;
			if (!pattern) {
				// Match commander error message
				return program.error(`[error] Missing required argument 'pattern'`);
			}

			// Find the files and delegate them to the callback
			const files = await glob(pattern);
			return fileHandler(files, options);
		},
	);
}
