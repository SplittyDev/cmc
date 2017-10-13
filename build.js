/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');

const packager = require('electron-packager');
const sass = require('sass/sass.dart.js');
const Cleancss = require('clean-css');
const archiver = require('archiver');

const wasRequired = require.main !== module;

function log(msg) {
  if (wasRequired) return;
  // eslint-disable-next-line no-console
  console.log(msg);
}

function build() {
  log('Building content...');
  const dirContent = path.join(__dirname, 'src/content');
  const dirSass = path.join(dirContent, 'sass');
  const dirCss = path.join(dirContent, 'css');

  // Transpile SASS
  log('-- Transpiling SASS...');
  const compiledSass = sass
    .renderSync({ file: path.join(dirSass, 'style.sass') })
    .css.toString('utf8');

  // Minify CSS
  log('-- Minifying CSS...');
  const minifiedCss = new Cleancss().minify(compiledSass);

  // Save css
  log('-- Writing files to disk...');
  fs.writeFileSync(path.join(dirCss, 'style.css'), compiledSass);
  fs.writeFileSync(path.join(dirCss, 'style.min.css'), minifiedCss.styles);
  fs.writeFileSync(path.join(dirCss, 'style.css.map'), minifiedCss.sourceMap);
}

async function pack() {
  build();
  log('Packaging files...');
  const options = {
    dir: __dirname,
    out: path.join(__dirname, 'bin', process.env.npm_package_version),
    all: true, // build for all platforms
    asar: true, // use asar archive format
    overwrite: true, // always produce clean builds
    download: {
      strictSSL: true, // require SSL
    },
    icon: 'src/icon/icon', // extension is auto-completed
  };
  if (options.asar) log('-- Using ASAR archive format.');
  if (options.all) log('-- Building for all supported platforms.');
  const appPaths = await packager(options);
  appPaths.forEach((appPath) => {
    log(`-- Built ${path.basename(appPath)}, zipping now...`);
    const output = fs.createWriteStream(`${appPath}.zip`);
    const archive = archiver('zip');
    archive.on('finish', () => {
      log(`-- Finished zipping ${path.basename(appPath)}.`);
    });
    archive.pipe(output);
    archive.directory(appPath, false);
    archive.finalize();
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === 'pack') pack();
  else build();
}

if (!wasRequired) {
  main();
}

module.exports = build;
