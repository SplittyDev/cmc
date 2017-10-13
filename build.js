const fs = require('fs');
const path = require('path');

const packager = require('electron-packager');
const sass = require('sass/sass.dart.js');
const cleancss = require('clean-css');
const archiver = require('archiver');

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
    icon: "src/icon/icon", // extension is auto-completed
  };
  if (options.asar) log('-- Using ASAR archive format.');
  if (options.all) log('-- Building for all supported platforms.');
  const appPaths = await packager(options);
  let zipped = 0;
  for (let appPath of appPaths) {
    log(`-- Built ${path.basename(appPath)}.`);
    log(`-- Zipping ${path.basename(appPath)}...`);
    const output = fs.createWriteStream(`${appPath}.zip`);
    const archive = archiver("zip");
    archive.on('finish', () => {
      console.log(`-- Finished zipping ${path.basename(appPath)}.`);
      zipped += 1;
    });
    archive.pipe(output);
    archive.directory(appPath, false);
    archive.finalize();
  }
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
