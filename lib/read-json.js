import Promise from 'bluebird';
import _readJSON from 'read-json';

export default Promise.promisify(_readJSON);
