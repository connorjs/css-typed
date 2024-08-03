<div align="center">

# css-typed

TypeScript declaration generator for CSS files.

<img alt="css-typed logo" src="images/css-typed.svg" width="400">

</div>

<details>
<summary><strong>Table of Contents</strong></summary>

- [Usage](#usage)
- [Recipes](#recipes)
- [Motivation](#motivation)
- [Contributing](#contributing)
- [Implementation details](#implementation-details)

</details>

## Usage

### Install

Install the CLI tool as a dev dependency.

```shell
npm install --save-dev css-typed
```

### Run

Run `css-typed` and pass it a glob targeting your CSS files.

```shell
npx css-typed 'src/**/*.css'
```

This will generate `.d.css.ts` files next to the original source files.

> **Note**
>
> A CSS module file with the name `foo.module.css` will emit `foo.module.d.css.ts`.

### Configure

Configure TypeScript to allow arbitrary extensions (TS 5+).

```json
{
	"compilerOptions": {
		"allowArbitraryExtensions": true
	}
}
```

Add `*.d.css.ts` to your `.gitignore` if appropriate.
(See [#4] for more information about alternative output directory.)

```shell
echo '*.d.css.ts' >> .gitignore
```

[#4]: https://github.com/connorjs/css-typed/issues/4

## Options

The following table lists the options `css-typed` supports.
Also run `css-typed -h` on the command line.

|      CLI option      |   Default    | Description                    |
| :------------------: | :----------: | :----------------------------- |
| `--localsConvention` | `dashesOnly` | Style of exported class names. |

### localsConvention

Inspired by [postcss localsConvention](https://github.com/madyankin/postcss-modules#localsconvention).
Adds `none` option value to use the class name as-is.

The `--localsConvention` option changes the style of exported class names, the exports in your TS (i.e., the JS names).

`css-typed` will only camelize dashes in class names by default (the `dashesOnly` option value).
It will not preserve the original class name.
For example, `my-class` becomes `myClass` and you cannot use `my-class` in JS/TS code.

Modern bundlers or build system such as Vite and Gatsby support this transformation.
The default matches CSS naming practices (`kebab-case`).

> **IMPORTANT**
>
> Note that the non-`*Only` values MAY have TypeScript bugs.
> TypeScript 5.6 may help with the named exports for these.
>
> If you encounter a bug, please file an issue.
> In the mean-time, consider using `camelCaseOnly` instead (or `dashesOnly` which is the default).

## Recipes

### Run script

To run it as part of your build, you will likely include it as a run script, maybe as `codegen` or `pretsc`.

```json
{
	"scripts": {
		"codegen": "css-typed \"src/**/*.css\"",
		"pretsc": "css-typed \"src/**/*.css\"",
		"tsc": "tsc"
	}
}
```

### Watch

The CLI does not have built-in watch support.
Feel free to [nodemon] or similar.

```json
{
	"scripts": {
		"codegen": "css-typed \"src/**/*.css\"",
		"codegen:watch": "nodemon -x \"npm run codegen\" -w src -e css"
	}
}
```

[nodemon]: https://www.npmjs.com/package/nodemon

## Motivation

[typescript-plugin-css-modules] provides a great IDE experience, but cannot perform build-failing type-checking.
Furthermore, the traditional TypeScript ambient module definition fails the `noUncheckedIndexedAccess` strict check and causes issues with typed ESLint rules.

```ts
// This does not provide strict typing
declare module "*.module.css" {
	const classes: { [key: string]: string };
	export default classes; // It also uses default export 😿
}
```

[typed-css-modules] and [typed-scss-modules] exist, but the former does not have recent activity and the latter focuses on SCSS.
(My current (2023/2024) interests involve modern CSS only.)
Both depend on [css-modules-loader-core], which appears [abandoned][174].

Therefore, I wrote my own (very basic) implementation.

[typescript-plugin-css-modules]: https://www.npmjs.com/package/typescript-plugin-css-modules
[typed-css-modules]: https://www.npmjs.com/package/typed-css-modules
[typed-scss-modules]: https://www.npmjs.com/package/typed-scss-modules
[css-modules-loader-core]: https://www.npmjs.com/package/css-modules-loader-core
[174]: https://github.com/css-modules/css-modules-loader-core/issues/174

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Implementation details

This (very basic) implementation uses [glob] for file matching and [css-tree] for CSS parsing.
It extracts CSS classes (`ClassSelector` in CSS Tree’s AST) and exports them as `string` constants (named exports).

I chose CSS Tree after a brief search because it had a nice API, good documentation, and supported CSS nesting (a requirement for my original use case).

[glob]: https://www.npmjs.com/package/glob
[css-tree]: https://www.npmjs.com/package/css-tree
