#!/bin/bash

# Check for SASS
command -v sass >/dev/null 2>&1 || {
    echo >&2 "SASS not installed."
    echo >&2 "Please install SASS from: http://sass-lang.com/install"
    exit 1
}

# Check for CleanCSS
command -v cleancss >/dev/null 2>&1 || {
    echo >&2 "CleanCSS CLI not installed."
    echo >&2 "Please install CleanCSS CLI from: https://github.com/jakubpawlowicz/clean-css-cli"
    exit 1
}

# Transpile
echo "Transpiling SASS..."

# Check if SASS file exists
if [ ! -f content/sass/style.sass ]; then
    echo "File not found: content/sass/style.sass"
    echo "Please navigate to project root and try again."
    exit 1
fi

# Start SASS
sass content/sass/style.sass content/css/style.css

# Minify
echo "Minifying CSS..."

# Check if CSS file exists
if [ ! -f content/css/style.css ]; then
    echo "File not found: content/css/style.css"
    echo "Please check if this file exists and try again."
    exit 1
fi

# Start CleanCSS CLI
cleancss content/css/style.css -o content/css/style.min.css

# Check for Electron
command -v electron >/dev/null 2>&1 || {
    echo >&2 "Electron not installed."
    echo >&2 "Please install Electron from: https://electron.atom.io/"
    exit 1
}

# Launch Electron
echo "Launching Electron..."
electron .

# Finished
echo "Done."
