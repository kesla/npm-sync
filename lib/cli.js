import parseArgs from './parse-args';
import setup from './index';

export default (args) => {
  const opts = parseArgs(args);

  setup(opts)
    .catch(err => {
      console.error(err.stack);
    });
}
