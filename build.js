/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');

const packager = require('electron-packager');
const sass = require('sass/sass.dart.js');
const Cleancss = require('clean-css');
const archiver = require('archiver');
const installer = require('electron-installer-windows');

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
  const outDir = path.join(__dirname, 'bin', process.env.npm_package_version);
  const packagerOptions = {
    dir: __dirname,
    out: outDir,
    all: true, // build for all platforms
    asar: true, // use asar archive format
    overwrite: true, // always produce clean builds
    download: {
      strictSSL: true, // require SSL
    },
    ignore: [ // paths to ignore
      '/bin($|/)', // bin folder
      '/\\.vscode($|/)', // .vscode folder
      '/.*\\.(md|png)$', // images and markdown
      '/\\.[a-zA-Z\\.]+$', // dotfiles
      '/build\\.js', // build.js
      '\\.(psd|sass)$', // unnecessary files
    ],
    prune: true, // remove dev-dependencies from package
    icon: 'src/icon/icon', // extension is auto-completed
  };
  if (packagerOptions.asar) log('-- Using ASAR archive format.');
  else log('-- Using regular package format.');
  if (packagerOptions.all) log('-- Building for all supported platforms.');
  const appPaths = await packager(Object.assign({}, packagerOptions));
  appPaths.forEach((appPath) => {
    const basename = path.basename(appPath);
    log(`-- Built ${basename}, zipping now...`);
    const output = fs.createWriteStream(`${appPath}.zip`);
    const archive = archiver('zip');
    archive.on('finish', () => {
      log(`-- Finished zipping ${basename}.`);
    });
    archive.pipe(output);
    archive.directory(appPath, false);
    archive.finalize();
    if (basename.includes('win32')) {
      log(`-- Creating Windows installer for ${basename}.`);
      const installerOptions = {
        src: appPath,
        dest: outDir,
        icon: path.join(__dirname, `${packagerOptions.icon}.ico`),
      };
      installer(installerOptions, (err) => {
        if (err) log(`Error: ${err}`);
        else log(`-- Finished creating installer for ${basename}.`);
      });
    }
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
