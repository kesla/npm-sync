import {wrap as co} from 'co';
import entries from 'object.entries';
import {resolve, join} from 'path';
import {assign} from 'immutable-object-methods';
import setupDownload from './download';
import linkBins from './link-bins';
import readPackageJson from './read-package-json';

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

    const packageNames = Object.keys(dependencies);
    const args = entries(dependencies).map(
      ([packageName, version]) => `${packageName}@${version}`
    );

    console.time('getIdealPackageTree');
    const idealTree = yield getIdealPackageTree(args);
    console.timeEnd('getIdealPackageTree');
    console.time('download');
    yield download({tree: idealTree, dir: join(packageDir, 'node_modules')});
    console.timeEnd('download');
    console.time('linkBins');
    yield linkBins({packageNames, dir: join(packageDir, 'node_modules')});
    console.timeEnd('linkBins');
  });
};
