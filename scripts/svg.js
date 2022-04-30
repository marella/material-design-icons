import * as fs from 'node:fs/promises';
import path from 'node:path';
import isSvg from 'is-svg';

import { getVersions } from './metadata.js';
import {
  map,
  filter,
  downloadAll,
  mkdirs,
  remove,
  exists,
  assertEquals,
} from './utils.js';

const styles = {
  icons: ['filled', 'outlined', 'round', 'sharp', 'two-tone'],
  symbols: ['outlined', 'rounded', 'sharp'],
};

const getStyleDirs = (symbols, dir) => {
  const type = symbols === true ? 'symbols' : 'icons';
  return Object.fromEntries(
    styles[type].map((style) => [style, path.resolve(dir, style)])
  );
};

export const deleteSvgs = async (symbols, dir) => {
  const styleDirs = getStyleDirs(symbols, dir);
  const dirs = Object.values(styleDirs);
  console.log('Deleting SVGs');
  await remove(dirs);
  console.log('Done');
};

export const downloadSvgs = async (symbols, dir) => {
  const styleDirs = getStyleDirs(symbols, dir);
  const dirs = Object.values(styleDirs);
  await mkdirs(dirs);
  console.log('Fetching metadata');
  const versions = await getVersions(symbols);
  const downloads = getDownloads(symbols, versions, styleDirs);
  console.log('::group::Downloading SVGs');
  await downloadAll(downloads, { ignoreExisting: true });
  console.log('::endgroup::');
  await checkSvgs(dirs);
  await checkCounts(dirs, Object.keys(versions).length);
  await checkDownloads(downloads);
  console.log('Done');
};

const getDownloads = (symbols, versions, styleDirs) => {
  const url = ({ theme, icon, version }) =>
    symbols === true
      ? `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${theme}/${icon}/default/24px.svg`
      : `https://fonts.gstatic.com/s/i/materialicons${theme}/${icon}/v${version}/24px.svg`;
  const downloads = [];
  for (const [icon, version] of Object.entries(versions)) {
    for (const [style, dir] of Object.entries(styleDirs)) {
      const file = path.resolve(dir, `${icon}.svg`);
      const theme = style.replaceAll('filled', '').replaceAll('-', '').trim();
      downloads.push([url({ theme, icon, version }), file]);
    }
  }
  return downloads;
};

const checkSvgs = async (dirs) => {
  console.log('Checking SVGs');
  await map(dirs, async (dir) => {
    const files = await fs.readdir(dir);
    await map(files, async (file) => {
      file = path.resolve(dir, file);
      if (await isSvgFile(file)) {
        return;
      }
      await remove(file);
    });
  });
};

const isSvgFile = async (file) => {
  if (!file.endsWith('.svg')) {
    return false;
  }
  const svg = (await fs.readFile(file)).toString();
  return svg.startsWith('<svg') && svg.endsWith('</svg>') && isSvg(svg);
};

const checkCounts = async (dirs, expected) => {
  console.log('Checking file counts');
  await map(dirs, async (dir) => {
    const actual = (await fs.readdir(dir)).length;
    assertEquals(
      actual,
      expected,
      `number of files in ${path.relative('', dir)}`
    );
  });
};

const checkDownloads = async (downloads) => {
  console.log('Checking downloads');
  const missing = await filter(
    downloads,
    async ([_, file]) => !(await exists(file))
  );
  assertEquals(missing.length, 0, 'missing downloads');
};
