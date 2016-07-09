import downloadNpmPackage from 'download-npm-package';
import getIdealPackageTree from 'get-ideal-package-tree';
import inject from './inject';

module.exports = inject({getIdealPackageTree, downloadNpmPackage});
