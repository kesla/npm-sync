import test from 'tapava';

import isPackageInstalled from '../lib/dir-to-ideal-tree/is-package-installed';

import makeTestFiles from './utils/make-test-files';

test('isPackageInstalled() dir does not exist', async t => {
  const actual = await isPackageInstalled({
    dir: '/does/not/exists',
    packageName: 'packageName',
    version: '1.0.0'
  });
  t.false(actual, 'package is not installed');
});

test('isPackageInstalled() wrong version', async t => {
  const packageName = 'packageName';
  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: packageName,
      version: '1.2.1'
    }, null, 2)
  });
  const actual = await isPackageInstalled({
    dir, packageName, version: '1.2.3'
  });
  t.false(actual, 'package is not installed');
});

test('isPackageInstalled() correct version', async t => {
  const packageName = 'packageName';
  const version = '1.2.1';
  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: packageName,
      version
    }, null, 2)
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.true(actual, 'package is installed');
});

test('isPackageInstalled() missing bundleDependencies', async t => {
  const packageName = 'packageName';
  const version = '1.2.1';
  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: packageName,
      version,
      bundleDependencies: ['packageName2']
    }, null, 2)
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.false(actual, 'package is not installed');
});

test('isPackageInstalled() with bundleDependencies', async t => {
  const packageName = 'packageName';
  const version = '1.2.1';
  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: packageName,
      version,
      bundleDependencies: ['packageName2']
    }, null, 2),
    'node_modules': {
      packageName2: {
        'package.json': JSON.stringify({
          name: 'package2',
          version: '1.0.0'
        }, null, 2)
      }
    }
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.true(actual, 'package is not installed');
});

test('isPackageInstalled() with bundledDependencies', async t => {
  const packageName = 'packageName';
  const version = '1.2.1';
  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: packageName,
      version,
      bundledDependencies: ['packageName2']
    }, null, 2),
    'node_modules': {
      packageName2: {
        'package.json': JSON.stringify({
          name: 'package2',
          version: '1.0.0'
        }, null, 2)
      }
    }
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.true(actual, 'package is not installed');
});
