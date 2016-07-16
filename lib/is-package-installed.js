import {join} from 'path';
import readJSON from 'then-read-json';
import fs from 'then-fs';

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
    return packageJson.name === packageName && packageJson.version === version &&
      await checkBundleDependencies(packageJson, dir);
  } catch (err) {
    return false;
  }
};
