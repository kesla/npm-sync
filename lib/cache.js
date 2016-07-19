// TODO: move to npmjs
export default ({load}) => {
  const cache = {};

  return {
    get: async key => {
      if (cache[key]) {
        return cache[key];
      }

      // TODO: handle in-flight requests here

      cache[key] = await load(key);
      return cache[key];
    }
  };
};
