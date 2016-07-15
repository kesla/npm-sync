import {join} from 'path';

import test from 'tapava';
import fs from 'then-fs';
import {dirSync as tmp} from 'tmp';
import sortBy from 'lodash.sortby';
import mkdirp from 'mkdirp-then';

import inject from '../lib/inject';

test('simple package.json', async t => {
  const expectedArgs = [
    'a@^1.0.0', 'b@~2.5.1'
  ];

  const getIdealPackageTree = actualArgs => {
    t.deepEqual(actualArgs.sort(), expectedArgs);
    return Promise.resolve({
      a: {
        version: '1.2.3'
      },
      b: {
        version: '2.5.9',
        dependencies: {
          c: {version: '3.0.0'}
        }
      },
      c: {
        version: '2.0.0'
      }
    });
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  await fs.writeFile(`${dir}/package.json`, JSON.stringify({
    dependencies: {
      a: '^1.0.0'
    },
    devDependencies: {
      b: '~2.5.1'
    }
  }));

  await inject({getIdealPackageTree, downloadPackage})({dir});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.2.3', dir: `${dir}/node_modules`},
    {arg: 'b@2.5.9', dir: `${dir}/node_modules`},
    {arg: 'c@2.0.0', dir: `${dir}/node_modules`},
    {arg: 'c@3.0.0', dir: `${dir}/node_modules/b/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});

test('simple package.json, production === true', async t => {
  const expectedArgs = [
    'a@^1.0.0', 'b@~2.5.1'
  ];

  const getIdealPackageTree = actualArgs => {
    t.deepEqual(actualArgs, expectedArgs);
    return Promise.resolve({
      a: {
        version: '1.2.3'
      },
      b: {
        version: '2.5.9',
        dependencies: {
          c: {version: '3.0.0'}
        }
      },
      c: {
        version: '2.0.0'
      }
    });
  };

  const _actualDownloadArguments = [];
  const downloadPackage = async ({arg, dir}) => {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    await mkdirp(join(dir, packageName));
    await fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  await fs.writeFile(`${dir}/package.json`, JSON.stringify({
    dependencies: {
      a: '^1.0.0',
      b: '~2.5.1'
    },
    devDependencies: {
      c: '^3.0.0'
    }
  }));

  await inject({getIdealPackageTree, downloadPackage})({dir, production: true});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.2.3', dir: `${dir}/node_modules`},
    {arg: 'b@2.5.9', dir: `${dir}/node_modules`},
    {arg: 'c@2.0.0', dir: `${dir}/node_modules`},
    {arg: 'c@3.0.0', dir: `${dir}/node_modules/b/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});
