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
  .action((options) => {
    downloadFonts(options.to);
  });

downloadCommand
  .command('svg')
  .option('--to <directory>', 'download directory', 'svg')
  .action((options) => {
    downloadSvgs(options.to);
  });

downloadCommand
  .command('metadata')
  .option('--to <directory>', 'download directory', '_data')
  .action((options) => {
    downloadVersions(options.to);
  });

program
  .command('delete')
  .command('svg')
  .option('--in <directory>', 'svg directory', 'svg')
  .action((options) => {
    deleteSvgs(options.in);
  });

program.parse();
