import test from 'tapava';
import fs from 'then-fs';
import tmp from 'then-tmp';
import mkdirp from 'mkdirp-then';

import linkBins from '../lib/link-bins';

test('linkBins()', async t => {
  const {path: _dir} = await tmp.dir();
  const dir = await fs.realpath(_dir);
  await mkdirp(`${dir}/package1`);
  await mkdirp(`${dir}/package2/bin`);
  await mkdirp(`${dir}/package3`);

  await fs.writeFile(`${dir}/package1/package.json`, JSON.stringify({}));
  await fs.writeFile(`${dir}/package2/package.json`, JSON.stringify({
    bin: {
      foo: 'bin/foo.js',
      bar: 'bin/bar.js'
    }
  }));
  await fs.writeFile(`${dir}/package2/bin/foo.js`, '');
  await fs.writeFile(`${dir}/package2/bin/bar.js`, '');
  await fs.writeFile(`${dir}/package3/package.json`, JSON.stringify({
    bin: {
      beep: 'bin/boop.js'
    }
  }));
  await linkBins({
    packageNames: ['package1', 'package2'],
    dir
  });
  const fooStat = await fs.lstat(`${dir}/.bin/foo`);
  const barStat = await fs.lstat(`${dir}/.bin/bar`);

  t.true(fooStat.isSymbolicLink());
  t.true(barStat.isSymbolicLink());

  t.is(await fs.realpath(`${dir}/.bin/foo`), `${dir}/package2/bin/foo.js`);
  t.is(await fs.realpath(`${dir}/.bin/bar`), `${dir}/package2/bin/bar.js`);

  try {
    await fs.stat(`${dir}/.bin/beep`);
    t.fail('.bin/beep should not exists');
  } catch (err) {
    t.is(err.code, 'ENOENT', 'no bin for beep');
  }
});

test('linkBins(), bin === String', async t => {
  const {path: _dir} = await tmp.dir();
  const dir = await fs.realpath(_dir);
  await mkdirp(`${dir}/package/bin`);

  await fs.writeFile(`${dir}/package/package.json`, JSON.stringify({
    bin: 'bin/foo.js',
    name: 'package'
  }));
  await fs.writeFile(`${dir}/package/bin/foo.js`, '');
  await linkBins({
    packageNames: ['package'],
    dir
  });
  const fooStat = await fs.lstat(`${dir}/.bin/package`);

  t.true(fooStat.isSymbolicLink());

  t.is(await fs.realpath(`${dir}/.bin/package`), `${dir}/package/bin/foo.js`);
});
