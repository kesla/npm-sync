// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';
import assert from 'assert';

import entries from 'object.entries';
import rimraf from 'rimraf-then';
import fs from 'mz/fs';
import {green, yellow, red, italic} from 'chalk';

import isPackageInstalled from './is-package-installed';
import readJSON from './read-package-json';

const log = process.env.NPM_SYNC_LOGGING ?
  console.log : () => {};

const setupInstall = downloadPackage => async function install({tree = {}, dir}) {
  await Promise.all(entries(tree).map(async input => {
    const [packageName, {version, dependencies}] = input;
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, 'node_modules', packageName);
    const packageInstalled = await isPackageInstalled({
      dir: join(dir, 'node_modules', packageName), packageName, version});

    if (packageInstalled) {
      log(`${yellow(italic('keeping'))} ${arg} at ${join(dir, 'node_modules')}`);
    } else {
      log(`${green(italic('installing'))} ${arg} at ${join(dir, 'node_modules')}`);
      await downloadPackage({arg, dir: join(dir, 'node_modules')});
      // TODO: Better error message
      assert(await fs.exists(join(dir, 'node_modules', packageName)),
        `${join(dir, 'node_modules', packageName)} should exists`);
    }
    await install({tree: dependencies, dir: packageDir});
  }));
};

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

export default downloadPackage => {
  const install = setupInstall(downloadPackage);

  return async opts => {
    await prune(opts);
    await install(opts);
  };
};
