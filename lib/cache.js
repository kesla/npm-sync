import fastCache from 'fast-cache';

export default load => {
  const cache = {};

  return key => {
    cache[key] = cache[key] || fastCache(() => load(key));
    return cache[key]();
  };
};
