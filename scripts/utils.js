import * as fs from 'node:fs/promises';
import path from 'node:path';
import del from 'del';
import got from 'got';

/* Network */

export const get = async (url, { agent, raw = false } = {}) => {
  const response = await got(url, { headers: { 'user-agent': agent } });
  return raw ? response.rawBody : response.body;
};

export const downloadAll = async (
  downloads,
  { concurrency, ignoreExisting = false } = {}
) => {
  if (ignoreExisting) {
    downloads = await filter(
      downloads,
      async (item) => !(await exists(item[1]))
    );
  }
  await apply(download, downloads, { concurrency });
};

const download = async (url, file) => {
  console.log(`Downloading ${path.relative('', file)}`);
  const data = await get(url, { raw: true });
  await fs.writeFile(file, data);
};

/* Filesystem */

/**
 * @see https://github.com/jprichardson/node-fs-extra/blob/master/lib/path-exists/index.js
 */
export const exists = async (path) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

export const mkdirs = async (dirs) => {
  await map(dirs, async (dir) => {
    try {
      await fs.mkdir(dir);
      console.log(`Created ${path.relative('', dir)}`);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
  });
};

export const walk = async (dir, func) => {
  const stat = await fs.lstat(dir);
  if (stat.isFile()) {
    await func(dir);
    return;
  }
  const files = await fs.readdir(dir);
  await map(files, async (file) => {
    file = path.resolve(dir, file);
    await walk(file, func);
  });
};

export const remove = async (paths) => {
  const deleted = await del(paths);
  deleted.forEach((p) => {
    console.log(`Deleted ${path.relative('', p)}`);
  });
};

/* Async */

export const apply = async (func, args, { concurrency = 8 } = {}) => {
  const results = [];
  let i = 0;
  const next = async () => {
    const j = i++;
    if (j >= args.length) {
      return;
    }
    results[j] = await func(...args[j]);
    await next();
  };
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
};

export const map = async (values, predicate) => {
  values = values.map((v, i) => [v, i]);
  return await apply(predicate, values);
};

export const filter = async (values, predicate) => {
  const results = await map(values, predicate);
  return values.filter((_, i) => results[i]);
};

/* Others */

export const sortMap = (map) => Object.fromEntries(Object.entries(map).sort());

export const assertEquals = (actual, expected, name) => {
  if (actual !== expected) {
    throw new Error(`${name} should be '${expected}' not '${actual}'`);
  }
};

export const assertNotEquals = (actual, expected, name) => {
  if (actual === expected) {
    throw new Error(`${name} should not be '${expected}'`);
  }
};
