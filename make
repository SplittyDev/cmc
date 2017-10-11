#!/bin/bash

sass content/sass/style.sass content/css/style.css
cleancss content/css/style.css -o content/css/style.min.css
electron .
