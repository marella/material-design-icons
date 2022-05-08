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
  walk,
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
  const downloads = await getDownloads(symbols, versions, styleDirs);
  console.log('::group::Downloading SVGs');
  await downloadAll(downloads, { ignoreExisting: true });
  console.log('::endgroup::');
  await checkSvgs(dirs);
  await checkDownloads(downloads);
  console.log('Done');
};

const getDownloads = async (symbols, versions, styleDirs) => {
  const variations = [];
  if (symbols === true) {
    for (const fill of [0, 1]) {
      for (const weight of [100, 200, 300, 400, 500, 600, 700]) {
        const axes = { fill, weight };
        const subdir = `${fill === 0 ? '' : 'fill-'}${weight}`;
        variations.push({ axes, subdir });
      }
    }
  } else {
    variations.push({ subdir: '' });
  }
  const downloads = [];
  for (const [style, dir] of Object.entries(styleDirs)) {
    await mkdirs(variations.map(({ subdir }) => path.resolve(dir, subdir)));
    const theme = style.replaceAll('filled', '').replaceAll('-', '').trim();
    for (const [icon, version] of Object.entries(versions)) {
      const url = (axes) => {
        if (!axes) {
          return `https://fonts.gstatic.com/s/i/materialicons${theme}/${icon}/v${version}/24px.svg`;
        }
        let { fill, weight } = axes;
        fill = fill === 0 ? '' : `fill${fill}`;
        weight = weight === 400 ? '' : `wght${weight}`;
        axes = weight + fill || 'default';
        return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${theme}/${icon}/${axes}/48px.svg`;
      };
      for (const { axes, subdir } of variations) {
        const file = path.resolve(dir, subdir, `${icon}.svg`);
        downloads.push([url(axes), file]);
      }
    }
  }
  return downloads;
};

const checkSvgs = async (dirs) => {
  console.log('Checking SVGs');
  await map(dirs, async (dir) => {
    await walk(dir, async (file) => {
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

const checkDownloads = async (downloads) => {
  console.log('Checking downloads');
  const missing = await filter(
    downloads,
    async ([_, file]) => !(await exists(file))
  );
  assertEquals(missing.length, 0, 'missing downloads');
};
