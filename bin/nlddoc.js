#!/usr/bin/env node

import { program } from 'commander'
import { serve } from '../src/cli/serve.js'
import { build } from '../src/cli/build.js'

program
  .name('nlddoc')
  .description('Ultralight markdown documentation viewer and static site generator')
  .version('0.1.0')

program
  .command('serve [path]')
  .description('Start development server for viewing documentation')
  .option('-p, --port <number>', 'Port number', '5173')
  .option('--no-open', 'Do not open browser automatically')
  .option('--host', 'Allow external access')
  .action(serve)

program
  .command('build [input] [output]')
  .description('Build static site from documentation')
  .option('--base <path>', 'Base URL path for deployment', '/')
  .option('--clean', 'Clean output directory without confirmation')
  .action(build)

program.parse()
