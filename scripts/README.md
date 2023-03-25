# [@material-design-icons/scripts](https://github.com/marella/material-design-icons/tree/main/scripts)

Scripts to download latest Material Symbols and Material Icons.

> For Material Symbols, see [`material-symbols`](https://www.npmjs.com/package/material-symbols) and [`@material-symbols/svg-400`](https://www.npmjs.com/package/@material-symbols/svg-400)
>
> For Material Icons, see [`@material-design-icons/font`](https://www.npmjs.com/package/@material-design-icons/font) and [`@material-design-icons/svg`](https://www.npmjs.com/package/@material-design-icons/svg)

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

### Font

To download icon fonts to a directory (default: `font`), run:

```sh
npx @material-design-icons/scripts download font --to <directory>
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

### Metadata

To download metadata of icons to a directory (default: `_data`), run:

```sh
npx @material-design-icons/scripts download metadata --to <directory>
```

To generate TypeScript types in a directory (default: `font`), run:

```sh
npx @material-design-icons/scripts generate types --in <directory>
```

### Material Symbols

To download Material Symbols, run above commands with `--symbols` option:

```sh
npx @material-design-icons/scripts download font --symbols
npx @material-design-icons/scripts download svg --symbols
npx @material-design-icons/scripts download metadata --symbols
npx @material-design-icons/scripts generate types --symbols
```

To customize fill (default: `0..1`), weight (default: `100..700`), grade (default: `-50..200`), and optical size (default: `20..48`) for fonts, use:

```sh
npx @material-design-icons/scripts download font --symbols --fill <number> --weight <number> --grade <number> --size <number>
```

To customize weight (default: `400`), and optical size (default: `48`) for SVGs, use:

```sh
npx @material-design-icons/scripts download svg --symbols --weight <number> --size <number>
```

## License

Material Symbols and Material Icons are created by [Google](https://github.com/google/material-design-icons#license).

> We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0][license]. Feel free to remix and re-share these icons and documentation in your products.
We'd love attribution in your app's *about* screen, but it's not required.

[license]: https://github.com/marella/material-design-icons/blob/main/scripts/LICENSE
