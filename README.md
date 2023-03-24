# css-typed

Basic TypeScript declaration generator for CSS files.

## Motivation

[typescript-plugin-css-modules] provides a great IDE experience, but cannot
perform build-failing type-checking. Furthermore, the traditional TypeScript
ambient module definition fails the `noUncheckedIndexedAccess` strict check and
causes issues with typed ESLint rules.

```ts
// This does not provide strict typing
declare module "*.module.css" {
	const classes: { [key: string]: string };
	export default classes; // It also uses default export 😿
}
```

[typed-css-modules] and [typed-scss-modules] exist, but the former does not have
recent activity and the latter focuses on SCSS (and my current (2023) interests
involve modern CSS only). Both depend on [css-modules-loader-core], which
appears [abandoned][174].

Therefore, I wrote my own (very basic) implementation.

<!-- prettier-ignore-start -->
[typescript-plugin-css-modules]: https://www.npmjs.com/package/typescript-plugin-css-modules
[typed-css-modules]: https://www.npmjs.com/package/typed-css-modules
[typed-scss-modules]: https://www.npmjs.com/package/typed-scss-modules
[css-modules-loader-core]: https://www.npmjs.com/package/css-modules-loader-core
[174]: https://github.com/css-modules/css-modules-loader-core/issues/174
<!-- prettier-ignore-end -->
