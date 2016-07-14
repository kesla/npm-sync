import {join} from 'path';

import mkdirp from 'mkdirp-then';
import entries from 'object.entries';
import symlink from 'fs-symlink';
import readJSON from 'then-read-json';

const getBin = ({bin = {}, name}) =>
  typeof bin === 'string' ? {[name]: bin} : bin;

const linkPackageJson = function * ({dir, packageName}) {
  const bin = getBin(yield readJSON(join(dir, packageName, 'package.json')));
  yield entries(bin).map(([name, dst]) => (function * () {
    const dstPath = join(dir, '.bin', name);
    const srcPath = join(dir, packageName, dst);

    yield symlink(srcPath, dstPath);
  })());
};

export default function * (opts) {
  const {packageNames, dir} = opts;

  yield mkdirp(join(dir, '.bin'));
  yield packageNames.map(packageName => linkPackageJson({dir, packageName}));
}
