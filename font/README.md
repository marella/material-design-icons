# [@material-design-icons/font](https://github.com/marella/material-design-icons/tree/main/font)

Latest icon fonts and CSS for material design icons.

> This package is automatically updated, so it will always have the latest icons from Google.

> For Material Symbols, see [`material-symbols`](https://www.npmjs.com/package/material-symbols)
>
> For SVGs, see [`@material-design-icons/svg`](https://www.npmjs.com/package/@material-design-icons/svg)

- [Installation](#installation)
- [Usage](#usage)
- [Available Icons](#available-icons)

## Installation

Install the [latest version][releases] using:

```sh
npm install @material-design-icons/font@latest
```

## Usage

Import in JS (example: `src/index.js` in Create React App, `src/main.js` in Vue CLI):

```js
import '@material-design-icons/font';
```

or import in CSS (example: `src/styles.css` in Angular CLI):

```css
@import '@material-design-icons/font';
```

or import in HTML:

```html
<link href="/path/to/@material-design-icons/font/index.css" rel="stylesheet">
```

To display an icon, use one of the following:

```html
<span class="material-icons">face</span>          <!-- Filled -->
<span class="material-icons-outlined">face</span> <!-- Outlined -->
<span class="material-icons-round">face</span>    <!-- Round -->
<span class="material-icons-sharp">face</span>    <!-- Sharp -->
<span class="material-icons-two-tone">face</span> <!-- Two Tone -->
```

### Reducing Build Size

The default `index.css` includes CSS for all fonts. This may cause build tools such as webpack to copy all fonts to the build directory even if you are not using all of them. To reduce the build size, import only the styles you need. For example, if you only need filled and outlined icons, import `filled.css` and `outlined.css` instead of the default `index.css`:

```diff
-import '@material-design-icons/font';
+import '@material-design-icons/font/filled.css';
+import '@material-design-icons/font/outlined.css';
```

<details>
<summary><strong>Show all</strong></summary><br>

Icons | CSS | Sass
:--- | :--- | :---
Filled | filled.css | filled.scss
Outlined | outlined.css | outlined.scss
Round | round.css | round.scss
Sharp | sharp.css | sharp.scss
Two Tone | two-tone.css | two-tone.scss

</details>

### Using Sass

Import in Sass (example: `src/styles.scss` in Angular CLI):

```scss
@import '@material-design-icons/font';
```

If you are getting errors with webpack or Vue CLI, add this line before importing:

```scss
$material-design-icons-font-path: '~@material-design-icons/font/';
```

### Using Angular `mat-icon`

To display an icon, use one of the following:

```html
<mat-icon>face</mat-icon>
<mat-icon fontSet="material-icons-outlined">face</mat-icon>
<mat-icon fontSet="material-icons-round">face</mat-icon>
<mat-icon fontSet="material-icons-sharp">face</mat-icon>
<mat-icon fontSet="material-icons-two-tone">face</mat-icon>
```

## Available Icons

See [demo].

## License

Material design icons are created by [Google](https://github.com/google/material-design-icons#license).

> We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0][license]. Feel free to remix and re-share these icons and documentation in your products.
We'd love attribution in your app's *about* screen, but it's not required.

[releases]: https://github.com/marella/material-design-icons/releases
[license]: https://github.com/marella/material-design-icons/blob/main/font/LICENSE
[demo]: https://marella.github.io/material-design-icons/demo/font/
