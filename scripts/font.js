import path from 'node:path';
import { promisify } from 'node:util';
import fontkit from 'fontkit';

import { getVersions } from './metadata.js';
import { get, map, apply, downloadAll, assertEquals } from './utils.js';

const FONTS = {
  icons: [
    'Material Icons',
    'Material Icons Outlined',
    'Material Icons Round',
    'Material Icons Sharp',
    'Material Icons Two Tone',
  ],
  symbols: [
    'Material Symbols Outlined',
    'Material Symbols Rounded',
    'Material Symbols Sharp',
  ],
};

const AGENTS = {
  woff2:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36', // chrome 70
  woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko', // ie 11
};

const baseUrl = 'https://fonts.googleapis.com/css2?family=';

export const downloadFonts = async (symbols, dir, evergreen) => {
  const type = symbols === true ? 'symbols' : 'icons';
  const fontFormats = [];
  const agents = evergreen ? { woff2: AGENTS['woff2'] } : AGENTS;
  for (const name of FONTS[type]) {
    for (const format of Object.keys(agents)) {
      fontFormats.push([name, format]);
    }
  }
  const urls = await apply(getFontUrl, fontFormats);
  const downloads = urls.map(([url, file]) => [url, path.resolve(dir, file)]);
  await downloadAll(downloads, { concurrency: 2 });
  const versions = await getVersions(symbols);
  await checkFonts(downloads, versions);
  console.log('Done');
};

const getFontUrl = async (name, format) => {
  const suffix = name.toLowerCase().includes('symbols')
    ? ':opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
    : '';
  const url = baseUrl + name.replaceAll(' ', '+') + suffix;
  const agent = AGENTS[format];
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

const checkFonts = async (downloads, versions) => {
  console.log('Checking fonts');
  const files = downloads.map(([_, file]) => file);
  await map(files, async (file) => {
    const ligatures = await processFont(file);
    for (const name of Object.keys(versions)) {
      if (!ligatures[name]) {
        throw new Error(`Icon ${name} not found in ${path.relative('', file)}`);
      }
    }
  });
};

const processFont = async (file) => {
  const open = promisify(fontkit.open);
  const font = await open(file);
  const ligatures = {};
  font.GSUB.lookupList.toArray().forEach(({ subTables }) => {
    subTables.forEach((subTable) => {
      const { coverage, ligatureSets } = subTable.extension || subTable;
      if (!ligatureSets) {
        return;
      }
      const prefixes = [];
      coverage.rangeRecords.forEach(({ start, end }) => {
        for (let i = start; i <= end; i++) {
          prefixes.push(i);
        }
      });
      ligatureSets.toArray().forEach((ligatureSet, i) => {
        ligatureSet.forEach(({ components }) => {
          const ligature = [prefixes[i], ...components]
            .map((v) => font.stringsForGlyph(v)[0])
            .join('')
            .toLowerCase();
          ligatures[ligature] = true;
        });
      });
    });
  });
  return ligatures;
};

const kebabCase = (s) => s.toLowerCase().replaceAll(' ', '-');
