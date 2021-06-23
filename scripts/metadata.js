import * as fs from 'node:fs/promises';
import path from 'node:path';

import { get, sortMap } from './utils.js';

const url = 'https://fonts.google.com/metadata/icons';

export const downloadVersions = async (dir) => {
  const file = path.resolve(dir, 'versions.json');
  console.log(`Downloading ${file}`);
  const versions = await getVersions();
  await fs.writeFile(file, JSON.stringify(versions, null, 2));
  console.log('Done');
};

export const getVersions = async () => {
  const { icons } = await getMetadata();
  const versions = {};
  icons.forEach(({ name, version }) => {
    versions[name] = version;
  });
  return sortMap(versions);
};

const getMetadata = async () => {
  let data = await get(url);
  data = data.substring(data.indexOf('\n')); // remove first line
  return JSON.parse(data);
};
