#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { Command } from 'commander';

import { downloadFonts } from './font.js';
import { downloadSvgs, deleteSvgs } from './svg.js';
import { downloadVersions } from './metadata.js';

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
  .option('--to <directory>', 'download directory', 'font')
  .option('--evergreen', 'download fonts for evergreen browsers only')
  .action(async (options) => {
    await downloadFonts(options.to, options.evergreen);
  });

downloadCommand
  .command('svg')
  .option('--to <directory>', 'download directory', 'svg')
  .action(async (options) => {
    await downloadSvgs(options.to);
  });

downloadCommand
  .command('metadata')
  .option('--to <directory>', 'download directory', '_data')
  .option('--status', 'set exit status based on metadata changes')
  .option('--dry-run', "don't save changes")
  .action(async (options) => {
    const status = await downloadVersions(options.to, options.dryRun);
    if (options.status) {
      process.exitCode = status;
    }
  });

program
  .command('delete')
  .command('svg')
  .option('--in <directory>', 'svg directory', 'svg')
  .action(async (options) => {
    await deleteSvgs(options.in);
  });

await program.parseAsync();
