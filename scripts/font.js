import path from 'path';

import { get, apply, downloadAll, assertEquals } from './utils.js';

const fonts = [
  'Material Icons',
  'Material Icons Outlined',
  'Material Icons Round',
  'Material Icons Sharp',
  'Material Icons Two Tone',
];

const agents = {
  woff2:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36', // chrome 70
  woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko', // ie 11
};

const baseUrl = 'https://fonts.googleapis.com/icon?family=';

export const downloadFonts = async (dir) => {
  const fontFormats = [];
  for (const name of fonts) {
    for (const format of Object.keys(agents)) {
      fontFormats.push([name, format]);
    }
  }
  const urls = await apply(getFontUrl, fontFormats);
  const downloads = urls.map(([url, file]) => [url, path.resolve(dir, file)]);
  await downloadAll(downloads, { concurrency: 2 });
  console.log('Done');
};

const getFontUrl = async (name, format) => {
  const url = baseUrl + name.replaceAll(' ', '+');
  const agent = agents[format];
  console.log(`Fetching download URL for '${name}' font in '${format}' format`);
  const css = await get(url, { agent });
  const font = parseCss(css);
  assertEquals(font.name, name, 'font name');
  assertEquals(font.format, format, 'font format');
  const file = kebabCase(font.name) + '.' + font.format;
  return [font.url, file];
};

const parseCss = (css) => {
  const name = css.match(/font-family: '([^']+)';/)[1];
  const src = css.match(/src: url\(([^\)]+)\) format\('([^']+)'\);/);
  const url = src[1];
  const format = src[2];
  const extension = url.substring(url.lastIndexOf('.') + 1);
  assertEquals(extension, format, 'font extension');
  return { name, url, format };
};

const kebabCase = (s) => s.toLowerCase().replaceAll(' ', '-');
