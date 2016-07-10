import test from 'tapava';
import fs from 'then-fs';
import {dirSync as tmp} from 'tmp';
import inject from '../lib/inject';
import Promise from 'bluebird';
import sortBy from 'lodash.sortby';
import mkdirp from 'mkdirp-then';
import {join} from 'path';

test('simple package.json', function * (t) {
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
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield fs.writeFile(`${dir}/package.json`, JSON.stringify({
    dependencies: {
      a: '^1.0.0'
    },
    devDependencies: {
      b: '~2.5.1'
    }
  }));

  yield inject({getIdealPackageTree, downloadNpmPackage})({dir});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.2.3', dir: `${dir}/node_modules`},
    {arg: 'b@2.5.9', dir: `${dir}/node_modules`},
    {arg: 'c@2.0.0', dir: `${dir}/node_modules`},
    {arg: 'c@3.0.0', dir: `${dir}/node_modules/b/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});

test('simple package.json, production === true', function * (t) {
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
  const downloadNpmPackage = ({arg, dir}) => function * () {
    const [packageName] = arg.split('@');
    _actualDownloadArguments.push({arg, dir});
    yield mkdirp(join(dir, packageName));
    yield fs.writeFile(join(dir, packageName, 'package.json'), '{}');
  };

  const {name: dir} = tmp();
  yield fs.writeFile(`${dir}/package.json`, JSON.stringify({
    dependencies: {
      a: '^1.0.0',
      b: '~2.5.1'
    },
    devDependencies: {
      c: '^3.0.0'
    }
  }));

  yield inject({getIdealPackageTree, downloadNpmPackage})({dir, production: true});
  const actualDownloadArguments = sortBy(_actualDownloadArguments, 'arg');
  const expectedDownloadArguments = [
    {arg: 'a@1.2.3', dir: `${dir}/node_modules`},
    {arg: 'b@2.5.9', dir: `${dir}/node_modules`},
    {arg: 'c@2.0.0', dir: `${dir}/node_modules`},
    {arg: 'c@3.0.0', dir: `${dir}/node_modules/b/node_modules`}
  ];
  t.deepEqual(actualDownloadArguments, expectedDownloadArguments);
});
