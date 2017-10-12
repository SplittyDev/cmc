const fs = require('fs');
const path = require('path');

const packager = require('electron-packager');
const sass = require('sass/sass.dart.js');
const cleancss = require('clean-css');

const wasRequired = require.main !== module;

function log(msg) {
  if (wasRequired) return;
  console.log(msg);
}

function build() {
  log('Building content...');
  const dir_content = path.join(__dirname, 'src/content');
  const dir_sass = path.join(dir_content, 'sass');
  const dir_css = path.join(dir_content, 'css');

  // Transpile SASS
  log('-- Transpiling SASS...');
  const compiled_sass = sass
    .renderSync({file: path.join(dir_sass, 'style.sass')})
    .css.toString('utf8');

  // Minify CSS
  log('-- Minifying CSS...');
  const minified_css = new cleancss().minify(compiled_sass);

  // Save css
  log('-- Writing files to disk...');
  fs.writeFileSync(path.join(dir_css, 'style.css'), compiled_sass);
  fs.writeFileSync(path.join(dir_css, 'style.min.css'), minified_css.styles);
  fs.writeFileSync(path.join(dir_css, 'style.css.map'), minified_css.sourceMap);
}

function pack() {
  build();
  log('Packaging files...');
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
  if (options.asar) log('-- Using ASAR archive format.');
  if (options.all) log('-- Building for all supported platforms.');
  packager(options)
    .then((appPaths) => {
      for (let appPath of appPaths) {
        log(`Prebuilt: ${path.basename(appPath)}`);
      }
    }).catch(e => {
      log(e);
    });
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === 'pack') pack();
  else build ();
}

if (!wasRequired) {
  main();
}

module.exports = build;