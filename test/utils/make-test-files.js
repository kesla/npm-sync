import {makeTemp as _makeTestFiles} from 'mkfiletree';
import promisify from 'promisify-function';
import fs from 'mz/fs';

const fn = promisify(_makeTestFiles);

export default async obj => {
  const _dir = await fn('', obj);
  const dir = await fs.realpath(_dir);
  return dir;
};
