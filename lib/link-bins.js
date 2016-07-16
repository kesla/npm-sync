// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';

import mkdirp from 'mkdirp-then';
import entries from 'object.entries';
import symlink from 'fs-symlink';

import readJSON from './read-package-json';

const getBin = ({bin = {}, name}) =>
  typeof bin === 'string' ? {[name]: bin} : bin;

const linkPackageJson = async ({dir, packageName}) => {
  const bin = getBin(await readJSON(join(dir, packageName, 'package.json')));
  await Promise.all(entries(bin).map(async ([name, dst]) => {
    const dstPath = join(dir, '.bin', name);
    const srcPath = join(dir, packageName, dst);

    await symlink(srcPath, dstPath);
  }));
};

export default async opts => {
  const {packageNames, dir} = opts;

  await mkdirp(join(dir, '.bin'));
  await Promise.all(packageNames.map(packageName => linkPackageJson({dir, packageName})));
};
