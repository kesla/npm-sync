import {inject as setupDownloadNpmPackage} from 'download-npm-package';
import {inject as setupGetIdealPackageTree} from 'get-ideal-package-tree';
import {cached as setupGetPackage} from 'get-pkg-json';
import downloadGithubPackage from 'download-github-package';

import inject from './inject';

module.exports = opts => {
  const getPackage = setupGetPackage();
  const getIdealPackageTree = setupGetIdealPackageTree(getPackage);
  const downloadNpmPackage = setupDownloadNpmPackage(getPackage);

  const downloadPackage = ({arg, dir}) => {
    return getPackage(arg)
      .then(pkg => {
        return pkg._requested.type === 'hosted' ?
          downloadGithubPackage({arg: pkg._requested.spec, dir}) :
          downloadNpmPackage({arg, dir});
      });
  };

  return inject({getIdealPackageTree, downloadPackage})(opts);
};
