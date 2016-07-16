import test from 'tapava';
import {makeTemp as _makeTestFiles} from 'mkfiletree';
import promisify from 'promisify-function';

import isPackageInstalled from '../lib/is-package-installed';

const makeTestFiles = promisify(_makeTestFiles);

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
  const dir = await makeTestFiles('wrong-version', {
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
  const dir = await makeTestFiles('correct-version', {
    'package.json': JSON.stringify({
      name: packageName,
      version
    }, null, 2)
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.true(actual, 'package is not installed');
});

test('isPackageInstalled() missing bundleDependencies', async t => {
  const packageName = 'packageName';
  const version = '1.2.1';
  const dir = await makeTestFiles('wrong-version', {
    'package.json': JSON.stringify({
      name: packageName,
      version
    }, null, 2)
  });
  const actual = await isPackageInstalled({
    dir, packageName, version
  });
  t.false(actual, 'package is not installed');
});
