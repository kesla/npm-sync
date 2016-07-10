import entries from 'object.entries';
import {join} from 'path';

export default downloadNpmPackage => function * dirToIdealTree ({tree, dir}) {
  yield entries(tree).map(([packageName, {version, dependencies = {}}]) => (function * () {
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, 'node_modules', packageName);
    yield downloadNpmPackage({arg, dir: join(dir, 'node_modules')});
    yield dirToIdealTree({tree: dependencies, dir: packageDir});
  })());
};
