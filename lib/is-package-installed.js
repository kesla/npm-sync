import {join} from 'path';
import fs from 'then-fs';

import readJSON from './read-package-json';

const checkBundleDependencies = async (packageJson, packageDir) => {
  const {bundleDependencies = []} = packageJson;

  const hasBundleDependencies = await Promise.all(
    bundleDependencies.map(
      async dep => fs.exists(join(packageDir, 'node_modules', dep))
    )
  );

  return (hasBundleDependencies).every(value => value);
};

export default async ({dir, packageName, version}) => {
  const packageJsonPath = join(dir, 'package.json');
  try {
    const packageJson = await readJSON(packageJsonPath);

    // A package is defined to be installed if it has the right name, right version
    // and if the bundleDependencies are all available
    return packageJson.name === packageName && packageJson.version === version &&
      await checkBundleDependencies(packageJson, dir);
  } catch (err) {
    return false;
  }
};
