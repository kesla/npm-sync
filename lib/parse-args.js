import minimist from 'minimist';

export default args => {
  const {_, production} = minimist(args, {
    alias: {
      p: 'production'
    },
    boolean: 'production'
  });
  return {
    dir: _[0],
    production
  };
};
