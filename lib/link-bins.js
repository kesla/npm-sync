// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';

import mkdirp from 'mkdirp-then';
import entries from 'object.entries';
import symlink from 'fs-symlink';
import fs from 'mz/fs';

import readJSON from './read-package-json';

const getPackageNames = dir =>
  fs.readdir(join(dir, 'node_modules'))
    .then(files => files.filter(name => name !== '.bin'))
    .catch(() => []);

const getBin = ({bin = {}, name}) =>
  typeof bin === 'string' ? {[name]: bin} : bin;

const linkPackageJson = async ({dir, packageName}) => {
  const bin = getBin(await readJSON(join(dir, 'node_modules', packageName, 'package.json')));
  await Promise.all(entries(bin).map(async ([name, src]) => {
    const dstPath = join(dir, 'node_modules', '.bin', name);
    const srcPath = join(dir, 'node_modules', packageName, src);

    await symlink(srcPath, dstPath);
  }));
};

const linkDir = async ({dir, packageNames}) => {
  await mkdirp(join(dir, 'node_modules', '.bin'));
  await Promise.all(
    packageNames.map(packageName => linkPackageJson({dir, packageName})));
};

const linkBins = async opts => {
  const {dir} = opts;
  const packageNames = await getPackageNames(dir);

  if (packageNames.length > 0) {
    await Promise.all([
      Promise.all(packageNames.map(packageName => linkBins({
        dir: join(dir, 'node_modules', packageName)
      }))),
      linkDir({dir, packageNames})
    ]);
  }
};

export default linkBins;
