export default process.env.NPM_SYNC_LOGGING ?
  console.log : () => {};
