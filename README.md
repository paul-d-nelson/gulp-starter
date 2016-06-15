# Gulp Starter Project

## Introduction

This attempts to be a universal gulpfile.js, so many options are set in variables near the beginning of the file. The default asset pipeline uses Stylus for CSS preprocessing, axis and rupture for helpful mixins, and lost for the grid. JavaScript is linted and then bundled using Browserify and minified (if using --production). The default task then watches all of these files for changes, and starts BrowserSync which automatically recompiles and reloads your browser whenever changes are made.

The default file structure is:

    src/
        js/
        stylus/
            main.styl
        img/*.[jpg,png,svg,gif]
    public/ (output)
        css/main.css
        js/app.js
        img/*.[jpg,png,svg,gif]

## Getting started

First, you will need node (and npm) installed. If you are unsure how to do this for your system, follow the instructions at https://nodejs.org/en/.

Next, you will need to install gulp globally. Gulp is a javascript "streaming build system" which handles most of the assets for this project. We are using the newest version of Gulp (4), which is not officially released, so it must be installed like so:

    npm install gulpjs/gulp-cli -g

This installs the gulp cli globally. Then, to install all of the local dev dependencies:

    npm install

from the project directory (this directory).

After that, you should just be able to run `gulp` and a browser window will pop up. It will most likely be empty, since you haven't set up a local server for the site, but that is fine for now.

To just build the site without running BrowserSync, run:

    gulp build

which will include sourcemaps for Stylus and JavaScript. If you want to output the non-sourcemapped, minified assets, run:

    gulp build --production

Also, as a note, each time gulp is run, it deletes the `public` folder, so it is recommended to not store any important files within.

## Customization

The gulpfile.js tries to be as flexible as possible (i.e. not very), by using variables at the top of the file to define most every path and file gulp will look for when building.

The one variable you will most likely want to change will be the `devurl`. This tells BrowserSync what to proxy when running. If you set up a server on `localhost:8000`, for example, put that into the `devurl` variable.

The `index.html` file is provided simply as an example for pulling in the built assets, but this project can be a starting point for WordPress themes or a one-page app.

Feel free to remove jQuery if you so desire, it is just a quick example of how to use npm packages with Browserify.