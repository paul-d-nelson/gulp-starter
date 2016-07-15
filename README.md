# Gulp Starter Project

## Introduction

This attempts to be a universal gulpfile.js, so many options are set in variables near the beginning of the file. The default asset pipeline uses [Gulp](http://gulpjs.com/) (obviously), [Stylus](http://stylus-lang.com/) for CSS preprocessing, [axis](http://axis.netlify.com/) and [rupture](http://jescalan.github.io/rupture/) for helpful mixins, and [lost](https://github.com/peterramsing/lost) for the grid. JavaScript is linted and then bundled using [Browserify](http://browserify.org/) and minified (if using --production). It also uses ES6 syntax, so it is piped through Babelify (a Browserify plugin for [Babel](https://babeljs.io/)) The default task then watches all of these files for changes, and starts [BrowserSync](https://www.browsersync.io/) which automatically recompiles and reloads your browser whenever changes are made.

The default file structure is:

    src/
        js/
            main.js
        stylus/
            main.styl
        img/*.[jpg,png,svg,gif]
    public/ (output)
        css/main.css
        js/app.js
        img/*.[jpg,png,svg,gif]

## Getting started

First, you will need node (and npm) installed. If you are unsure how to do this for your system, follow the instructions at the [official Node site](https://nodejs.org/en/).

Next, you will need to install Gulp globally. Gulp is a JavaScript "streaming build system" which handles most of the assets for this project. We are using the newest version of Gulp (4), which is not officially released, so it must be installed like so:

    npm install gulpjs/gulp-cli -g

This installs the Gulp CLI globally. Then, to install all of the local dev dependencies:

    npm install

from the project directory (this directory).

To start up a basic static server and run Gulp, an npm script is here to help:

    npm start

To just build the site without running BrowserSync, run:

    npm run build-dev

which will include sourcemaps for Stylus and JavaScript. If you want to output the non-sourcemapped, minified assets, run:

    npm run build-prod

Also, as a note, each time gulp is run, it deletes the `public` folder, so it is recommended to not store any important files within. Everything should be in the `src` folder or the root directory.

## Customization

The gulpfile.js tries to be as flexible as possible (i.e. not very), by using variables at the top of the file to define most every path and file gulp will look for when building.

The one variable you will most likely want to change will be the `devurl`. This tells BrowserSync what to proxy when running. If you set up a server on `coolwebsite.dev`, for example, put that into the `devurl` variable.

The `index.html` file is provided simply as an example for pulling in the built assets, but this project can be a starting point for WordPress themes or a one-page app.