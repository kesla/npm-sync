import {inject as setupDownloadNpmPackage} from 'download-npm-package';
import {inject as setupGetIdealPackageTree} from 'get-ideal-package-tree';
import inject from './inject';
import setupGetPackage from 'get-package-json-from-registry';

module.exports = opts => {
  const getPackage = setupGetPackage();
  const getIdealPackageTree = setupGetIdealPackageTree(getPackage);
  const downloadNpmPackage = setupDownloadNpmPackage(getPackage);

  return inject({getIdealPackageTree, downloadNpmPackage})(opts);
};
