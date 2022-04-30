import * as fs from 'node:fs/promises';
import path from 'node:path';

import { get, sortMap, assertNotEquals } from './utils.js';

const url =
  'https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true';
const REMOVED = 0b100;
const UPDATED = 0b010;
const ADDED = 0b001;

export const downloadVersions = async (symbols, dir, dryRun) => {
  const file = path.resolve(dir, 'versions.json');
  console.log(`Downloading ${path.relative('', file)}`);
  const versions = await getVersions(symbols);
  const status = await checkChanges(file, versions);
  if (!dryRun) {
    await fs.writeFile(file, JSON.stringify(versions, null, 2));
  }
  console.log('Done');
  return status;
};

export const getVersions = async (symbols) => {
  assertNotEquals(symbols, undefined, 'symbols');
  const type = symbols === true ? 'symbols' : 'icons';
  const { icons } = await getMetadata();
  const versions = {};
  icons.forEach((icon) => {
    for (const family of icon.unsupported_families) {
      if (family.toLowerCase().includes(type)) {
        return;
      }
    }
    versions[icon.name] = icon.version;
  });
  return sortMap(versions);
};

const getMetadata = async () => {
  let data = await get(url);
  data = data.substring(data.indexOf('\n')); // remove first line
  return JSON.parse(data);
};

const checkChanges = async (file, latest) => {
  let existing;
  try {
    existing = JSON.parse(await fs.readFile(file));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(e.message);
    }
    return ADDED;
  }
  let status = 0;
  const { removed, updated, added } = getChanges(existing, latest);
  if (removed.length === 0 && updated.length === 0 && added.length === 0) {
    console.log('No changes');
    return status;
  }
  console.log('Changes:');
  if (removed.length !== 0) {
    console.log(`- Remove ${removed.length} icons: ${names(removed)}`);
    status |= REMOVED;
  }
  if (updated.length !== 0) {
    console.log(`- Update ${updated.length} icons`);
    status |= UPDATED;
  }
  if (added.length !== 0) {
    console.log(`- Add ${added.length} icons: ${names(added)}`);
    status |= ADDED;
  }
  return status;
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
