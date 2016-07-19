// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';
import assert from 'assert';

import entries from 'object.entries';
import fs from 'mz/fs';
import {green, yellow, italic} from 'chalk';

import log from '../log';
import isPackageInstalled from './is-package-installed';

// TODO replace these w already existing micromodules?
const mapPromise = (array, fn) => Promise.all(array.map(fn));
const isObject = value => typeof value === 'object' && value !== null;

const setupInstall = downloadPackage => {
  const install = ({tree, dir}) => {
    if (!isObject(tree)) {
      return Promise.resolve(null);
    }

    return mapPromise(entries(tree), async input => {
      const [packageName, {version, dependencies}] = input;
      const arg = `${packageName}@${version}`;
      const packageDir = join(dir, 'node_modules', packageName);
      const packageInstalled = await isPackageInstalled({
        dir: join(dir, 'node_modules', packageName), packageName, version});

      if (packageInstalled) {
        log(`${yellow(italic('keeping'))} ${arg} at ${join(dir, 'node_modules')}`);
        await install({tree: dependencies, dir: packageDir});
        return;
      }

      log(`${green(italic('installing'))} ${arg} at ${join(dir, 'node_modules')}`);
      // TODO: shasum check of tarball, retry if fails
      await downloadPackage({arg, dir: join(dir, 'node_modules')});

      // TODO: Better error message
      assert(await fs.exists(join(dir, 'node_modules', packageName)),
        `${join(dir, 'node_modules', packageName)} should exists`);

      // TODO: run preinstall
      await install({tree: dependencies, dir: packageDir});
      // TODO: run install
      // TODO: run postinstall
      // TODO: link bins (remove separate step)
    });
  };

  return install;
};

export default setupInstall;
