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

export const downloadSvgs = async (symbols, dir, axes) => {
  const styleDirs = getStyleDirs(symbols, dir);
  const dirs = Object.values(styleDirs);
  await mkdirs(dirs);
  console.log('Fetching metadata');
  const versions = await getVersions(symbols);
  const downloads = getDownloads(symbols, versions, styleDirs, axes);
  console.log('::group::Downloading SVGs');
  await downloadAll(downloads, { ignoreExisting: true });
  console.log('::endgroup::');
  await checkSvgs(dirs);
  await checkDownloads(downloads);
  console.log('Done');
};

const getDownloads = (symbols, versions, styleDirs, axes) => {
  const variations = [];
  if (symbols === true) {
    for (const fill of [0, 1]) {
      const suffix = fill === 0 ? '' : '-fill';
      variations.push({ axes: { ...axes, fill }, suffix });
    }
  } else {
    variations.push({ suffix: '' });
  }
  const downloads = [];
  for (const [style, dir] of Object.entries(styleDirs)) {
    const theme = style.replaceAll('filled', '').replaceAll('-', '').trim();
    for (const [icon, version] of Object.entries(versions)) {
      const url = (axes) => {
        if (!axes) {
          return `https://fonts.gstatic.com/s/i/materialicons${theme}/${icon}/v${version}/24px.svg`;
        }
        let { fill, weight, size } = axes;
        fill = fill === 0 ? '' : `fill${fill}`;
        weight = weight === 400 ? '' : `wght${weight}`;
        axes = weight + fill || 'default';
        return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${theme}/${icon}/${axes}/${size}px.svg`;
      };
      for (const { axes, suffix } of variations) {
        const file = path.resolve(dir, `${icon}${suffix}.svg`);
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
