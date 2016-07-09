import test from 'tapava';
import fs from 'then-fs';
import {dirSync as tmp} from 'tmp';
import inject from './lib/inject';
import Promise from 'bluebird';
import sortBy from 'lodash.sortby';

test('simple package.json', function * (t) {
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
  const downloadNpmPackage = ({arg, dir}) => {
    _actualDownloadArguments.push({arg, dir});
    return Promise.resolve(null);
  };

  const {name: dir} = tmp();
  yield fs.writeFile(`${dir}/package.json`, JSON.stringify({
    dependencies: {
      a: '^1.0.0',
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
