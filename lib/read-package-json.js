import {set, without} from 'immutable-object-methods';
import fs from 'then-fs';

export default fileName => fs.readFile(fileName, 'utf8')
  .then(file => Promise.resolve(JSON.parse(file)))
  .then(json => {
    const {bundledDependencies = json.bundleDependencies || json.bundledDependencies} = json;
    return without(
      set(json, 'bundleDependencies', bundledDependencies), 'bundledDependencies');
  });
