import {set, without} from 'immutable-object-methods';
import readJSON from 'then-read-json';

// TODO: memoize this?
export default async fileName => {
  const json = await readJSON(fileName);

  const bundleDependencies = json.bundleDependencies || json.bundledDependencies || [];

  return without(
    set(json, 'bundleDependencies', bundleDependencies), 'bundledDependencies');
};
