/* eslint-disable max-lines */
/* eslint-disable camelcase */

import {join} from 'path';

import test from 'tapava';
import fs from 'then-fs';
import sortBy from 'lodash.sortby';
import mkdirp from 'mkdirp-then';

import setupDirToIdealTree from '../lib/dir-to-ideal-tree';

import makeTestFiles from './utils/make-test-files';

test('dirToIdealTree() already existing packages, one good & one needs updating', async t => {
  const idealTree = {
    b: {
      version: '2.5.9',
      dependencies: {
        c: {
          version: '3.0.1'
        }
      }
    },
    c: {
      version: '2.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      name: 'irrelevant',
      version: '999'
    }),
    'node_modules': {
      b: {
        'node_modules': {
          c: {
            'package.json': JSON.stringify({
              name: 'c',
              version: '3.0.0'
            })
          }
        },
        'package.json': JSON.stringify({
          name: 'b',
          version: '2.5.9'
        })
      }
    }
  });

  await setupDirToIdealTree(downloadPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {
      arg: 'c@2.0.0',
      dir: `${dir}/node_modules`
    }, {
      arg: 'c@3.0.1',
      dir: `${dir}/node_modules/b/node_modules`
    }
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});

test('dirToIdealTree() with package that should be removed', async t => {
  const idealTree = {
    a: {
      version: '1.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const dir = await makeTestFiles({
    'package.json': JSON.stringify({
      dependencies: {
        a: '1.0.0'
      }
    }),
    'node_modules': {
      b: {
        'package.json': JSON.stringify({
          name: 'b',
          version: '2.5.9'
        }),
        'node_modules': {
          c: {
            'package.json': JSON.stringify({
              name: 'c',
              version: '3.0.0'
            })
          }
        }
      }
    }
  });

  await setupDirToIdealTree(downloadPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualFiles = await fs.readdir(`${dir}/node_modules`);
  const expectedFiles = ['a'];
  t.deepEqual(actualFiles, expectedFiles);
});

test('dirToIdealTree() with nested package that should be removed', async t => {
  const idealTree = {
    a: {
      version: '1.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const dir = await makeTestFiles({
    'node_modules': {
      a: {
        'package.json': JSON.stringify({}),
        'node_modules': {
          c: {
            'package.json': JSON.stringify({
              name: 'c',
              version: '3.0.0'
            })
          }
        }
      }
    },
    'package.json': JSON.stringify({
      dependencies: {
        a: '1.0.0'
      }
    })
  });

  await setupDirToIdealTree(downloadPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualExists = await fs.exists(`${dir}/node_modules/a/node_modules`);
  const expectedExists = false;
  t.deepEqual(actualExists, expectedExists);
});

test('dirToIdealTree() with multiple nested package where one should be removed', async t => {
  const idealTree = {
    a: {
      version: '1.0.0', dependencies: {
        b: {version: '3.0.0'}
      }
    }
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const dir = await makeTestFiles({
    'node_modules': {
      a: {
        'package.json': JSON.stringify({}),
        'node_modules': {
          b: {
            'package.json': JSON.stringify({
              name: 'b',
              version: '3.0.0'
            })
          },
          c: {
            'package.json': JSON.stringify({
              name: 'c',
              version: '3.0.0'
            })
          }
        }
      }
    },
    'package.json': JSON.stringify({
      dependencies: {
        a: '1.0.0'
      }
    })
  });

  await setupDirToIdealTree(downloadPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.0.0', dir: `${dir}/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualFiles = await fs.readdir(`${dir}/node_modules/a/node_modules`);
  const expectedFiles = ['b'];
  t.deepEqual(actualFiles, expectedFiles);
});

test('dirToIdealTree() with bundleDependencies', async t => {
  const idealTree = {
    a: {
      version: '1.0.0'
    }
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const dir = await makeTestFiles({
    'node_modules': {
      a: {
        'package.json': JSON.stringify({
          name: 'a',
          version: '1.0.0',
          bundleDependencies: ['b']
        }),
        'node_modules': {
          b: {
            'package.json': JSON.stringify({
              name: 'b',
              version: '3.0.0'
            })
          }
        }
      }
    },
    'package.json': JSON.stringify({
      dependencies: {
        a: '1.0.0'
      }
    })
  });

  await setupDirToIdealTree(downloadPackage)({dir, tree: idealTree});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
  const actualFiles = await fs.readdir(`${dir}/node_modules/a/node_modules`);
  const expectedFiles = ['b'];
  t.deepEqual(actualFiles, expectedFiles);
});
