import {resolve, join} from 'path';

import entries from 'object.entries';
import {assign} from 'immutable-object-methods';
import readJSON from 'then-read-json';

import setupDirToIdealTree from './dir-to-ideal-tree';
import linkBins from './link-bins';

const getDependencies = ({packageJson, production}) => {
  const {dependencies = {}, devDependencies = {}} = packageJson;
  return production ? dependencies : assign(devDependencies, dependencies);
};

export default ({downloadPackage, getIdealPackageTree}) => {
  const dirToIdealTree = setupDirToIdealTree(downloadPackage);

  return async ({dir, production}) => {
    const packageDir = dir ? resolve(process.cwd(), dir) : process.cwd();
    const packageJsonFilename = join(packageDir, 'package.json');

    const packageJson = await readJSON(packageJsonFilename);
    const dependencies = getDependencies({packageJson, production});

    const packageNames = Object.keys(dependencies);
    const args = entries(dependencies).map(
      ([packageName, version]) => `${packageName}@${version}`
    );

    console.time('getIdealPackageTree');
    const idealTree = await getIdealPackageTree(args);
    console.timeEnd('getIdealPackageTree');
    console.time('dirToIdealTree');
    await dirToIdealTree({tree: idealTree, dir: packageDir});
    console.timeEnd('dirToIdealTree');
    console.time('linkBins');
    await linkBins({packageNames, dir: join(packageDir, 'node_modules')});
    console.timeEnd('linkBins');
  };
};
