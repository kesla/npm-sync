import {join} from 'path';

import entries from 'object.entries';
import rimraf from 'rimraf-then';
import fs from 'then-fs';
import readJSON from 'then-read-json';

const isPackageInstalled = async ({dir, packageName, version}) => {
  const packageJsonPath = join(dir, 'node_modules', packageName, 'package.json');
  try {
    const packageJson = await readJSON(packageJsonPath);
    return packageJson.name === packageName && packageJson.version === version;
  } catch (err) {
    return false;
  }
};

const setupDownload = downloadPackage => async function download({tree = {}, dir}) {
  await Promise.all(entries(tree).map(async (input) => {
    const [packageName, {version, dependencies}] = input;
    const arg = `${packageName}@${version}`;
    const packageDir = join(dir, 'node_modules', packageName);
    const PackageInstalled = await isPackageInstalled({dir, packageName, version});
    if (!PackageInstalled) {
      await downloadPackage({arg, dir: join(dir, 'node_modules')});
    }
    await download({tree: dependencies, dir: packageDir});
  }));
};

const getFilenames = dir => fs.readdir(dir).catch(() => []);

const prune = async (opts) => {
  const {tree = {}, dir} = opts;
  const files = await getFilenames(join(dir, 'node_modules'));
  const packageNames = Object.keys(tree);

  if (files.every(fileName => !packageNames.includes(fileName))) {
    await rimraf(join(dir, 'node_modules'));
    return;
  }

  await Promise.all(files.map(fileName =>
    packageNames.includes(fileName) ?
    prune({
      tree: tree[fileName].dependencies,
      dir: join(dir, 'node_modules', fileName)
    }) :
    rimraf(join(dir, 'node_modules', fileName))
  ));
};

export default downloadPackage => {
  const download = setupDownload(downloadPackage);

  return async (opts) => {
    await prune(opts);
    await download(opts);
  };
};
