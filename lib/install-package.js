import assert from 'assert';
import {join} from 'path';

import fs from 'mz/fs';

export default downloadPackage => async ({arg, packageName, dir}) => {
  await downloadPackage({arg, dir: join(dir, 'node_modules')});
  // TODO: Better error message
  assert(await fs.exists(join(dir, 'node_modules', packageName)),
    `${join(dir, 'node_modules', packageName)} should exists`);
};
