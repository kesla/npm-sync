import entries from 'object.entries';
import {join} from 'path';

export default downloadNpmPackage => function * download ({tree, dir}) {
  yield entries(tree).map(([packageName, {version, dependencies = {}}]) => (function * () {
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, packageName, 'node_modules');
    yield downloadNpmPackage({arg, dir});
    yield download({tree: dependencies, dir: packageDir});
  })());
};