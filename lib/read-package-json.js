import {set, without} from 'immutable-object-methods';
import readJSON from 'then-read-json';

// NOTE: we're using this very simple caching mechanism because it's significantly
// faster than using `async-cache-promise`
// so let's consider if we can create a faster caching module?
const cache = {};

export default async fileName => {
  if (cache[fileName]) {
    return cache[fileName];
  }
  const json = await readJSON(fileName);

  const bundleDependencies = json.bundleDependencies || json.bundledDependencies || [];

  const fixed = without(
    set(json, 'bundleDependencies', bundleDependencies), 'bundledDependencies');
  cache[fileName] = fixed;
  return fixed;
};
