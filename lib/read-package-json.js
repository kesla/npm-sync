import {set, without} from 'immutable-object-methods';
import fs from 'then-fs';

export default fileName => fs.readFile(fileName, 'utf8')
  .then(file => Promise.resolve(JSON.parse(file)))
  .then(json => {
    const bundleDependencies = json.bundleDependencies || json.bundledDependencies || [];

    return without(
      set(json, 'bundleDependencies', bundleDependencies), 'bundledDependencies');
  });
