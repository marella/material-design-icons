import * as fs from 'fs/promises';
import path from 'path';

import { getVersions } from './metadata.js';
import { map, downloadAll, mkdirs, remove, assertEquals } from './utils.js';

const styles = ['filled', 'outlined', 'round', 'sharp', 'two-tone'];

const getStyleDirs = (dir) =>
  Object.fromEntries(styles.map((style) => [style, path.resolve(dir, style)]));

export const deleteSvgs = async (dir) => {
  const styleDirs = getStyleDirs(dir);
  const dirs = Object.values(styleDirs);
  console.log('Deleting SVGs');
  await remove(dirs);
  console.log('Done');
};

export const downloadSvgs = async (dir) => {
  const styleDirs = getStyleDirs(dir);
  const dirs = Object.values(styleDirs);
  await mkdirs(dirs);
  console.log('Fetching metadata');
  const versions = await getVersions();
  console.log('Downloading SVGs');
  const downloads = getDownloads(versions, styleDirs);
  await downloadAll(downloads, { ignoreExisting: true });
  await checkSvgs(dirs);
  await checkCounts(dirs, Object.keys(versions).length);
  console.log('Done');
};

const getDownloads = (versions, styleDirs) => {
  const downloads = [];
  for (const [icon, version] of Object.entries(versions)) {
    for (const [style, dir] of Object.entries(styleDirs)) {
      const file = path.resolve(dir, `${icon}.svg`);
      const theme = style.replaceAll('filled', '').replaceAll('-', '').trim();
      const url = `https://fonts.gstatic.com/s/i/materialicons${theme}/${icon}/v${version}/24px.svg`;
      downloads.push([url, file]);
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
      if (await isSvg(file)) {
        return;
      }
      await remove(file);
    });
  });
};

const isSvg = async (file) => {
  if (!file.endsWith('.svg')) {
    return false;
  }
  const svg = (await fs.readFile(file)).toString();
  return svg.startsWith('<svg') && svg.endsWith('</svg>');
};

const checkCounts = async (dirs, expected) => {
  console.log('Checking file counts');
  await map(dirs, async (dir) => {
    const actual = (await fs.readdir(dir)).length;
    assertEquals(actual, expected, `number of files in ${dir}`);
  });
};
