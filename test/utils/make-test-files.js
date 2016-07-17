import {makeTemp as _makeTestFiles} from 'mkfiletree';
import promisify from 'promisify-function';

const fn = promisify(_makeTestFiles);

export default obj => fn('', obj);
