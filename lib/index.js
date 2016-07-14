import {inject as setupDownloadNpmPackage} from 'download-npm-package';
import {inject as setupGetIdealPackageTree} from 'get-ideal-package-tree';
import setupGetPackage from 'get-package-json-from-registry';

import inject from './inject';

module.exports = opts => {
  const getPackage = setupGetPackage();
  const getIdealPackageTree = setupGetIdealPackageTree(getPackage);
  const downloadNpmPackage = setupDownloadNpmPackage(getPackage);

  return inject({getIdealPackageTree, downloadNpmPackage})(opts);
};
