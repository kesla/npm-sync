import {wrap as co} from 'co';
import Promise from 'bluebird';
import _readPackageJson from 'read-package-json';
import entries from 'object.entries';
import {resolve, join} from 'path';

const readPackageJson = Promise.promisify(_readPackageJson);

const setupDownload = downloadNpmPackage => function * download (tree, dir) {
  yield entries(tree).map(([packageName, {version, dependencies = {}}]) => (function * () {
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, packageName, 'node_modules');
    yield downloadNpmPackage({arg, dir});
    yield download(dependencies, packageDir);
  })());
};

export default ({downloadNpmPackage, getIdealPackageTree}) => co(function * ({dir}) {
  const packageDir = dir
    ? resolve(process.cwd(), dir)
    : process.cwd();
  const packageJson = join(packageDir, 'package.json');

  const {dependencies} = yield readPackageJson(packageJson);

  const args = entries(dependencies).map(
    ([packageName, version]) => `${packageName}@${version}`
  );

  const idealTree = yield getIdealPackageTree(args);
  yield setupDownload(downloadNpmPackage)(idealTree, join(packageDir, 'node_modules'));
});
