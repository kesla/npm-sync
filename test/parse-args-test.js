import test from 'tapava';
import parseArgs from '../lib/parse-args';

test('parseArgs()', t => {
  t.deepEqual(parseArgs([]), {dir: undefined, production: false});
  t.deepEqual(parseArgs(['--production']), {dir: undefined, production: true});
  t.deepEqual(parseArgs(['-p']), {dir: undefined, production: true});
  t.deepEqual(parseArgs(['foo/bar']), {dir: 'foo/bar', production: false});
});
