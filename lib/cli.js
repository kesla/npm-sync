#!/usr/bin/env node

import setup from './index';

const [, , dir] = process.argv;

setup({dir})
  .catch(err => {
    console.error(err.stack);
  });
