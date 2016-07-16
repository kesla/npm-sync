import {join} from 'path';
import readJSON from 'then-read-json';

export default async ({dir, packageName, version}) => {
  const packageJsonPath = join(dir, 'package.json');
  try {
    const packageJson = await readJSON(packageJsonPath);
    return packageJson.name === packageName && packageJson.version === version;
  } catch (err) {
    return false;
  }
};
