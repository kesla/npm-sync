import readPackageJson from './read-package-json';
import mkdirp from 'mkdirp-then';
import {join} from 'path';
import entries from 'object.entries';
import symlink from 'fs-symlink';

const linkPackageJson = function * ({dir, packageName}) {
  const {bin = {}} = yield readPackageJson(join(dir, packageName, 'package.json'));
  yield entries(bin).map(function * ([name, dst]) {
    const dstPath = join(dir, '.bin', name);
    const srcPath = join(dir, packageName, dst);

    yield symlink(srcPath, dstPath);
  });
};

export default function * (opts) {
  const {packageNames, dir} = opts;

  yield mkdirp(join(dir, '.bin'));
  yield packageNames.map(packageName => linkPackageJson({dir, packageName}));
}
