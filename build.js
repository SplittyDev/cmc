const packager = require('electron-packager')
const path = require('path');
const options = {
  dir: __dirname,
  out: path.join(__dirname, 'bin'),
  all: true, // build for all platforms
  asar: true, // use asar archive format
  overwrite: true, // always produce clean builds
  download: {
    strictSSL: true, // require SSL
  },
  icon: "icon/icon", // extension is auto-completed
};
packager(options)
  .then((appPaths) => {
    for (let appPath of appPaths) {
      console.log(`[Done] ${appPath}`);
    }
  }).catch(e => {
    console.log(e);
  });