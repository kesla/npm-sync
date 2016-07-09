#!/usr/bin/env node

import setup from './index';
import parseArgs from './parse-args';

const opts = parseArgs(process.argv.slice(2));

setup(opts)
  .catch(err => {
    console.error(err.stack);
  });
