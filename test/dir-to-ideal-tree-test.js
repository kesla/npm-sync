import {join} from 'path';

import test from 'tapava';
import fs from 'then-fs';
import {dirSync as tmp} from 'tmp';
import sortBy from 'lodash.sortby';
import mkdirp from 'mkdirp-then';

import setupDirToIdealTree from '../lib/dir-to-ideal-tree';

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
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield mkdirp(join(dir, 'node_modules/b/node_modules/c'));

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

test('dirToIdealTree() with package that should be removed', function * (t) {
  const idealTree = {
    a: {
      version: '1.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield mkdirp(join(dir, 'node_modules/b/node_modules/c'));
  yield fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    dependencies: {
      a: '1.0.0'
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
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualFiles = yield fs.readdir(`${dir}/node_modules`);
  const expectedFiles = ['a'];
  t.deepEqual(actualFiles, expectedFiles);
});

test('dirToIdealTree() with nested package that should be removed', function * (t) {
  const idealTree = {
    a: {
      version: '1.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield mkdirp(join(dir, 'node_modules/a/node_modules/c'));
  yield fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    dependencies: {
      a: '1.0.0'
    }
  }));

  yield fs.writeFile(join(dir, 'node_modules/a/node_modules/c/package.json'), JSON.stringify({
    name: 'c',
    version: '3.0.0'
  }));

  yield setupDirToIdealTree(downloadNpmPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualExists = yield fs.exists(`${dir}/node_modules/a/node_modules`);
  const expectedExists = false;
  t.deepEqual(actualExists, expectedExists);
});

test('dirToIdealTree() with multiple nested package where one should be removed', function * (t) {
  const idealTree = {
    a: {
      version: '1.0.0', dependencies: {
        b: {version: '3.0.0'}
      }
    }
  };

  const _actualDownloadArguments = [];
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield mkdirp(join(dir, 'node_modules/a/node_modules/b'));
  yield mkdirp(join(dir, 'node_modules/a/node_modules/c'));
  yield fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    dependencies: {
      a: '1.0.0', dependencies: {
        b: '3.0.0'
      }
    }
  }));

  yield fs.writeFile(join(dir, 'node_modules/a/node_modules/b/package.json'), JSON.stringify({
    name: 'b',
    version: '3.0.0'
  }));
  yield fs.writeFile(join(dir, 'node_modules/a/node_modules/c/package.json'), JSON.stringify({
    name: 'c',
    version: '3.0.0'
  }));

  yield setupDirToIdealTree(downloadNpmPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualFiles = yield fs.readdir(`${dir}/node_modules/a/node_modules`);
  const expectedFiles = ['b'];
  t.deepEqual(actualFiles, expectedFiles);
});
