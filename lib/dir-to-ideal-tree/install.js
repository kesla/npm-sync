// disable array-callback-return for async functions (that actually returns promises)
/* eslint-disable array-callback-return */
import {join} from 'path';
import assert from 'assert';

import entries from 'object.entries';
import fs from 'mz/fs';
import {green, yellow, italic} from 'chalk';

import log from '../log';
import isPackageInstalled from './is-package-installed';

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

export default setupInstall;
