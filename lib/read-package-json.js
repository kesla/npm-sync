import {set, without} from 'immutable-object-methods';
import readJSON from 'then-read-json';
import setupCache from './cache';

// NOTE: we're using this very simple caching mechanism because it's significantly
// faster than using `async-cache-promise`
// so let's consider if we can create a faster caching module?
const cache = setupCache(
  async fileName => {
    const json = await readJSON(fileName);

    const bundleDependencies = json.bundleDependencies || json.bundledDependencies || [];

    const fixed = without(
      set(json, 'bundleDependencies', bundleDependencies), 'bundledDependencies');
    return fixed;
  }
);

export default fileName => cache(fileName);
