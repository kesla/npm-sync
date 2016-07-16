import test from 'tapava';
import fs from 'then-fs';
import tmp from 'then-tmp';
import mkdirp from 'mkdirp-then';

import linkBins from '../lib/link-bins';

test('linkBins()', function * (t) {
  const {path: _dir} = yield tmp.dir();
  const dir = yield fs.realpath(_dir);
  yield mkdirp(`${dir}/package1`);
  yield mkdirp(`${dir}/package2/bin`);
  yield mkdirp(`${dir}/package3`);

  yield fs.writeFile(`${dir}/package1/package.json`, JSON.stringify({}));
  yield fs.writeFile(`${dir}/package2/package.json`, JSON.stringify({
    bin: {
      foo: 'bin/foo.js',
      bar: 'bin/bar.js'
    }
  }));
  yield fs.writeFile(`${dir}/package2/bin/foo.js`, '');
  yield fs.writeFile(`${dir}/package2/bin/bar.js`, '');
  yield fs.writeFile(`${dir}/package3/package.json`, JSON.stringify({
    bin: {
      beep: 'bin/boop.js'
    }
  }));
  yield linkBins({
    packageNames: ['package1', 'package2'],
    dir
  });
  const fooStat = yield fs.lstat(`${dir}/.bin/foo`);
  const barStat = yield fs.lstat(`${dir}/.bin/bar`);

  t.true(fooStat.isSymbolicLink());
  t.true(barStat.isSymbolicLink());

  t.is(yield fs.realpath(`${dir}/.bin/foo`), `${dir}/package2/bin/foo.js`);
  t.is(yield fs.realpath(`${dir}/.bin/bar`), `${dir}/package2/bin/bar.js`);

  try {
    yield fs.stat(`${dir}/.bin/beep`);
    t.fail('.bin/beep should not exists');
  } catch (err) {
    t.is(err.code, 'ENOENT', 'no bin for beep');
  }
});

test('linkBins(), bin === String', function * (t) {
  const {path: _dir} = yield tmp.dir();
  const dir = yield fs.realpath(_dir);
  yield mkdirp(`${dir}/package/bin`);

  yield fs.writeFile(`${dir}/package/package.json`, JSON.stringify({
    bin: 'bin/foo.js',
    name: 'package'
  }));
  yield fs.writeFile(`${dir}/package/bin/foo.js`, '');
  yield linkBins({
    packageNames: ['package'],
    dir
  });
  const fooStat = yield fs.lstat(`${dir}/.bin/package`);

  t.true(fooStat.isSymbolicLink());

  t.is(yield fs.realpath(`${dir}/.bin/package`), `${dir}/package/bin/foo.js`);
});
