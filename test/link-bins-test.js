/* eslint-disable camelcase */

import test from 'tapava';
import fs from 'mz/fs';
import tmp from 'then-tmp';
import mkdirp from 'mkdirp-then';

import linkBins from '../lib/link-bins';
import makeTestFiles from './utils/make-test-files';

test('linkBins()', async t => {
  const dir = await makeTestFiles({
    node_modules: {
      package1: {
        'package.json': JSON.stringify({})
      },
      package2: {
        'package.json': JSON.stringify({
          bin: {
            foo: 'bin/foo.js',
            bar: 'bin/bar.js'
          }
        }),
        'bin': {
          'bar.js': '',
          'foo.js': ''
        }
      },
      package3: {
        'package.json': JSON.stringify({
          bin: {
            beep: 'bin/beep.js'
          }
        }),
        'bin': {
          'beep.js': ''
        }
      }
    }
  });

  await linkBins({dir});
  const fooStat = await fs.lstat(`${dir}/node_modules/.bin/foo`);
  const barStat = await fs.lstat(`${dir}/node_modules/.bin/bar`);
  const beepStat = await fs.lstat(`${dir}/node_modules/.bin/beep`);

  t.true(fooStat.isSymbolicLink());
  t.true(barStat.isSymbolicLink());
  t.true(beepStat.isSymbolicLink());

  t.is(await fs.realpath(`${dir}/node_modules/.bin/foo`), `${dir}/node_modules/package2/bin/foo.js`);
  t.is(await fs.realpath(`${dir}/node_modules/.bin/bar`), `${dir}/node_modules/package2/bin/bar.js`);
  t.is(await fs.realpath(`${dir}/node_modules/.bin/beep`), `${dir}/node_modules/package3/bin/beep.js`);
});

test('linkBins(), bin === String', async t => {
  const {path: _dir} = await tmp.dir();
  const dir = await fs.realpath(_dir);
  await mkdirp(`${dir}/node_modules/package/bin`);

  await fs.writeFile(`${dir}/node_modules/package/package.json`, JSON.stringify({
    bin: 'bin/foo.js',
    name: 'package'
  }));
  await fs.writeFile(`${dir}/node_modules/package/bin/foo.js`, '');
  await linkBins({dir});
  const fooStat = await fs.lstat(`${dir}/node_modules/.bin/package`);

  t.true(fooStat.isSymbolicLink());

  t.is(await fs.realpath(`${dir}/node_modules/.bin/package`), `${dir}/node_modules/package/bin/foo.js`);
});
