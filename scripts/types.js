import * as fs from 'node:fs/promises';
import path from 'node:path';

import { getVersions } from './metadata.js';

export const generateTypes = async (symbols, dir) => {
  const file = path.resolve(dir, 'index.d.ts');
  console.log(`Generating ${path.relative('', file)}`);
  const versions = await getVersions(symbols);
  const types = getTypes(symbols, Object.keys(versions));
  await fs.writeFile(file, types);
  console.log('Done');
};

const getTypes = (isSymbol, icons) => {
  const lines = [];
  const formattedIcons = icons.map(icon => `  "${icon}"`);
  const typeNames = isSymbol === true ? ['MaterialSymbols', 'MaterialSymbol'] : ['MaterialIcons', 'MaterialIcon'];

  // type = list of all icons/sybmols
  lines.push(`type ${typeNames[0]} = [`);
  lines.push(formattedIcons.join(',\n'));
  lines.push('];');
  lines.push('');

  // type = union of all icons/symbols
  lines.push(`type ${typeNames[1]} = ${typeNames[0]}[number];`);
  lines.push('');

  // explicit export to avoid the following issue: https://stackoverflow.com/q/61797149
  lines.push(`export { ${typeNames[1]} };`);
  lines.push('');

  return lines.join('\n');
};
