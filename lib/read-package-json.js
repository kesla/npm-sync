import Promise from 'bluebird';
import _readPackageJson from 'read-package-json';

export default Promise.promisify(_readPackageJson);
