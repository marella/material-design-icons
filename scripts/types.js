import * as fs from 'node:fs/promises';
import path from 'node:path';

import { getVersions } from './metadata.js';

export const generateTypes = async (symbols, dir) => {
  const file = path.resolve(dir, 'index.d.ts');
  console.log(`Generating ${path.relative('', file)}`);
  const versions = await getVersions(symbols);
  const types = getTypes(Object.keys(versions));
  await fs.writeFile(file, types);
  console.log('Done');
};

const getTypes = (icons) => {
  return 'TODO';
};
