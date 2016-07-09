import {wrap as co} from 'co';
import Promise from 'bluebird';
import _readPackageJson from 'read-package-json';
import entries from 'object.entries';
import {resolve, join} from 'path';
import {assign} from 'immutable-object-methods';
import setupDownload from './download';

const readPackageJson = Promise.promisify(_readPackageJson);

const getDependencies = ({packageJson: {dependencies, devDependencies}, production}) => {
  return production ? dependencies : assign(devDependencies, dependencies);
};

export default ({downloadNpmPackage, getIdealPackageTree}) => {
  const download = setupDownload(downloadNpmPackage);

  return co(function * ({dir, production}) {
    const packageDir = dir
      ? resolve(process.cwd(), dir)
      : process.cwd();
    const packageJsonFilename = join(packageDir, 'package.json');

    const packageJson = yield readPackageJson(packageJsonFilename);
    const dependencies = getDependencies({packageJson, production});

    const args = entries(dependencies).map(
      ([packageName, version]) => `${packageName}@${version}`
    );

    const idealTree = yield getIdealPackageTree(args);

    yield download({tree: idealTree, dir: join(packageDir, 'node_modules')});
  });
};
