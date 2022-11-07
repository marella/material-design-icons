#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { Command, InvalidArgumentError } from 'commander';

import { downloadFonts } from './font.js';
import { downloadSvgs, deleteSvgs } from './svg.js';
import { downloadVersions } from './metadata.js';
import { generateTypes } from './types.js';

const choices = (values) => (value) => {
  value = parseInt(value, 10);
  if (!values.includes(value)) {
    throw new InvalidArgumentError(`Allowed choices are ${values.join(', ')}.`);
  }
  return value;
};

const pkg = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url))
);

const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description);

const downloadCommand = program.command('download');

downloadCommand
  .command('font')
  .option('--symbols', 'download symbols instead of icons', false)
  .option('--to <directory>', 'download directory', 'font')
  .option('--evergreen', 'download fonts for evergreen browsers only')
  .action(async (options) => {
    await downloadFonts(options.symbols, options.to, options.evergreen);
  });

downloadCommand
  .command('svg')
  .option('--symbols', 'download symbols instead of icons', false)
  .option('--to <directory>', 'download directory', 'svg')
  .option(
    '--weight <number>',
    "'wght' axis for symbols",
    choices([100, 200, 300, 400, 500, 600, 700]),
    400
  )
  .option(
    '--size <number>',
    "'opsz' axis for symbols",
    choices([20, 24, 40, 48]),
    48
  )
  .action(async (options) => {
    const axes = { weight: options.weight, size: options.size };
    await downloadSvgs(options.symbols, options.to, axes);
  });

downloadCommand
  .command('metadata')
  .option('--symbols', 'download symbols instead of icons', false)
  .option('--to <directory>', 'download directory', '_data')
  .option('--status', 'set exit status based on metadata changes')
  .option('--dry-run', "don't save changes")
  .action(async (options) => {
    const status = await downloadVersions(
      options.symbols,
      options.to,
      options.dryRun
    );
    if (options.status) {
      process.exitCode = status;
    }
  });

program
  .command('delete')
  .command('svg')
  .option('--symbols', 'delete symbols instead of icons', false)
  .option('--in <directory>', 'svg directory', 'svg')
  .action(async (options) => {
    await deleteSvgs(options.symbols, options.in);
  });

program
  .command('generate')
  .command('types')
  .option('--symbols', 'generate types for symbols instead of icons', false)
  .option('--in <directory>', 'package root directory', 'font')
  .action(async (options) => {
    await generateTypes(options.symbols, options.in);
  });

await program.parseAsync();
