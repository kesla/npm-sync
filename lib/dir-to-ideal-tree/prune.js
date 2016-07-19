// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';

import rimraf from 'rimraf-then';
import fs from 'mz/fs';
import {red, italic} from 'chalk';

import readJSON from '../read-package-json';
import log from '../log';

const getFilenames = dir => fs.readdir(dir).catch(() => []);

const rmDirIfEmpty = dir => fs.rmdir(dir).catch(() => null);

const prune = async opts => {
  const {tree = {}, dir} = opts;
  const files = await getFilenames(join(dir, 'node_modules'));
  const packageNames = Object.keys(tree);

  const {bundleDependencies} = await readJSON(join(dir, 'package.json'));

  await Promise.all(files
    .filter(fileName => fileName !== '.bin')
    .map(fileName => {
      if (bundleDependencies.includes(fileName)) {
        return Promise.resolve(null);
      }

      if (packageNames.includes(fileName)) {
        return prune({
          tree: tree[fileName].dependencies,
          dir: join(dir, 'node_modules', fileName)
        });
      }

      log(`${red(italic('removing'))} ${join(dir, 'node_modules', fileName)}`);
      return rimraf(join(dir, 'node_modules', fileName));
    })
  );

  await rmDirIfEmpty(join(dir, 'node_modules'));
};

export default prune;
