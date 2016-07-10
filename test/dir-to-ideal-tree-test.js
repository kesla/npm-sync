import test from 'tapava';
import fs from 'then-fs';
import {dirSync as tmp} from 'tmp';
import setupDirToIdealTree from '../lib/dir-to-ideal-tree';
import sortBy from 'lodash.sortby';
import mkdirp from 'mkdirp-then';
import {join} from 'path';

test('dirToIdealTree() already existing packages, one good & one needs updating', function * (t) {
  const idealTree = {
    b: {
      version: '2.5.9',
      dependencies: {
        c: {version: '3.0.1'}
      }
    },
    c: {
      version: '2.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadNpmPackage = ({arg, dir}) => function * (t) {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield mkdirp(join(dir, 'node_modules/b/node_modules/c'));
  yield fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    devDependencies: {
      b: '~2.5.1'
    }
  }));

  yield fs.writeFile(join(dir, 'node_modules/b/package.json'), JSON.stringify({
    name: 'b',
    version: '2.5.9'
  }));

  yield fs.writeFile(join(dir, 'node_modules/b/node_modules/c/package.json'), JSON.stringify({
    name: 'c',
    version: '3.0.0'
  }));

  yield setupDirToIdealTree(downloadNpmPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'c@2.0.0', dir: `${dir}/node_modules`},
    {arg: 'c@3.0.1', dir: `${dir}/node_modules/b/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});
