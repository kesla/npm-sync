import setupInstall from './install';
import prune from './prune';

export default downloadPackage => {
  const install = setupInstall(downloadPackage);

  return async opts => {
    await prune(opts);
    await install(opts);
  };
};
