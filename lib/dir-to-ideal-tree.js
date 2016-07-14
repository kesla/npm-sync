import {join} from 'path';

import entries from 'object.entries';
import rimraf from 'rimraf-then';
import fs from 'then-fs';
import readJSON from 'then-read-json';

const isPackageInstalled = function * ({dir, packageName, version}) {
  const packageJsonPath = join(dir, 'node_modules', packageName, 'package.json');
  try {
    const packageJson = yield readJSON(packageJsonPath);
    return packageJson.name === packageName && packageJson.version === version;
  } catch (err) {
    return false;
  }
};

const setupDownload = downloadNpmPackage => function * download({tree = {}, dir}) {
  yield entries(tree).map(([packageName, {version, dependencies}]) => (function * () {
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, 'node_modules', packageName);
    const PackageInstalled = yield isPackageInstalled({dir, packageName, version});
    if (!PackageInstalled) {
      yield downloadNpmPackage({arg, dir: join(dir, 'node_modules')});
    }
    yield download({tree: dependencies, dir: packageDir});
  })());
};

const getFilenames = dir => fs.readdir(dir).catch(() => []);

const prune = function * ({tree = {}, dir}) {
  const files = yield getFilenames(join(dir, 'node_modules'));
  const packageNames = Object.keys(tree);

  if (files.every(fileName => !packageNames.includes(fileName))) {
    yield rimraf(join(dir, 'node_modules'));
    return;
  }

  yield files.map(fileName =>
    packageNames.includes(fileName) ?
    prune({
      tree: tree[fileName].dependencies,
      dir: join(dir, 'node_modules', fileName)
    }) :
    rimraf(join(dir, 'node_modules', fileName))
  );
};

export default downloadNpmPackage => {
  const download = setupDownload(downloadNpmPackage);

  return function * dirToIdealTree(opts) {
    yield prune(opts);
    yield download(opts);
  };
};
