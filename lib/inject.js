import {wrap as co} from 'co';
import Promise from 'bluebird';
import _readPackageJson from 'read-package-json';
import entries from 'object.entries';
import {resolve} from 'path';

const readPackageJson = Promise.promisify(_readPackageJson);

export default ({downloadNpmPackage, getIdealPackageTree}) => co(function * ({dir}) {
  const packageJson = dir
    ? resolve(process.cwd(), dir, 'package.json')
    : resolve(process.cwd(), 'package.json');

  const {dependencies} = yield readPackageJson(packageJson);

  const args = entries(dependencies).map(
    ([packageName, version]) => `${packageName}@${version}`
  );

  const idealTree = yield getIdealPackageTree(args);

  console.log(idealTree);
});
