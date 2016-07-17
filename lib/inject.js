import {resolve, join} from 'path';

import entries from 'object.entries';
import {assign} from 'immutable-object-methods';
import {cyan, magenta} from 'chalk';

import setupDirToIdealTree from './dir-to-ideal-tree';
import linkBins from './link-bins';
import readJSON from './read-package-json';

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

    const time1 = new Date();
    console.log(cyan('getIdealPackageTree()'));
    const idealTree = await getIdealPackageTree(args);
    const time2 = new Date();

    console.log(cyan('dirToIdealTree()'));
    await dirToIdealTree({tree: idealTree, dir: packageDir});
    const time3 = new Date();

    console.log(cyan('linkBins()'));
    await linkBins({packageNames, dir: join(packageDir, 'node_modules')});
    const time4 = new Date();

    console.log(cyan('benchmark'));

    console.log(`${magenta(`${time2 - time1}ms`)}\tgetIdealPackageTree()`);
    console.log(`${magenta(`${time3 - time2}ms`)}\tdirToIdealTree()`);
    console.log(`${magenta(`${time4 - time3}ms`)}\tlinkBins()`);
  };
};
