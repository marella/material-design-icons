import * as fs from 'node:fs/promises';
import path from 'node:path';

import { get, sortMap } from './utils.js';

const url = 'https://fonts.google.com/metadata/icons';

export const downloadVersions = async (dir) => {
  const file = path.resolve(dir, 'versions.json');
  console.log(`Downloading ${file}`);
  const versions = await getVersions();
  await logChanges(file, versions);
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

const logChanges = async (file, latest) => {
  let existing;
  try {
    existing = JSON.parse(await fs.readFile(file));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(e.message);
    }
    return;
  }
  const { removed, updated, added } = getChanges(existing, latest);
  if (removed.length === 0 && updated.length === 0 && added.length === 0) {
    console.log('No changes');
    return;
  }
  console.log('Changes:');
  if (removed.length !== 0) {
    console.log(`- Remove ${removed.length} icons: ${names(removed)}`);
  }
  if (updated.length !== 0) {
    console.log(`- Update ${updated.length} icons`);
  }
  if (added.length !== 0) {
    console.log(`- Add ${added.length} icons: ${names(added)}`);
  }
};

const getChanges = (existing, latest) => {
  existing = sortMap(existing);
  latest = sortMap(latest);
  const removed = [];
  const updated = [];
  const added = [];
  for (const name of Object.keys(existing)) {
    if (!latest[name]) {
      removed.push(name);
    } else if (latest[name] !== existing[name]) {
      updated.push(name);
    }
  }
  for (const name of Object.keys(latest)) {
    if (!existing[name]) {
      added.push(name);
    }
  }
  return { removed, updated, added };
};

const names = (names) => names.map((name) => '`' + name + '`').join(', ');
