import entries from 'object.entries';
import {join} from 'path';
import readJSON from './read-json';

const isPackageInstalled = function * ({dir, packageName, version}) {
  const packageJsonPath = join(dir, 'node_modules', packageName, 'package.json');
  try {
    const packageJson = yield readJSON(packageJsonPath);
    return packageJson.name === packageName && packageJson.version === version;
  } catch (err) {
    return false;
  }
};

export default downloadNpmPackage => function * dirToIdealTree ({tree, dir}) {
  yield entries(tree).map(([packageName, {version, dependencies = {}}]) => (function * () {
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, 'node_modules', packageName);
    const PackageInstalled = yield isPackageInstalled({dir, packageName, version});
    if (!PackageInstalled) {
      yield downloadNpmPackage({arg, dir: join(dir, 'node_modules')});
    }
    yield dirToIdealTree({tree: dependencies, dir: packageDir});
  })());
};
