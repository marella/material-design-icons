# Material Design Icons

Scripts to download material design icons.

> For SVGs, see [`@material-design-icons/svg`](https://www.npmjs.com/package/@material-design-icons/svg)
>
> For icon fonts, see [`@material-design-icons/font`](https://www.npmjs.com/package/@material-design-icons/font)

## Installation

Requirements:

- Node >= 16

Installation is not required but if you want to add it as a local dependency to a project, run:

```sh
npm install @material-design-icons/scripts@latest --save-dev
```

## Usage

To display help, run:

```sh
npx @material-design-icons/scripts --help
```

### SVG

To download SVGs to a directory (default: `svg`), run:

```sh
npx @material-design-icons/scripts download svg --to <directory>
```

To delete SVGs in a directory (default: `svg`), run:

```sh
npx @material-design-icons/scripts delete svg --in <directory>
```

The `download svg` command will skip downloading existing SVGs. To update existing SVGs, first delete them using `delete svg` and then run `download svg`.

### Font

To download icon fonts to a directory (default: `font`), run:

```sh
npx @material-design-icons/scripts download font --to <directory>
```

### Metadata

To download metadata of icons to a directory (default: `_data`), run:

```sh
npx @material-design-icons/scripts download metadata --to <directory>
```

## License

Material design icons are created by [Google](https://github.com/google/material-design-icons#license).

> We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0][license]. Feel free to remix and re-share these icons and documentation in your products.
We'd love attribution in your app's *about* screen, but it's not required. The only thing we ask is that you not re-sell these icons.

[license]: https://github.com/marella/material-design-icons/blob/main/scripts/LICENSE
