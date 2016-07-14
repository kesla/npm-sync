#!/usr/bin/env node

import parseArgs from './parse-args';
import setup from './index';

const opts = parseArgs(process.argv.slice(2));

setup(opts)
  .catch(err => {
    console.error(err.stack);
  });
