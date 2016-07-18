import gulp from 'gulp'
import rename from 'gulp-rename'
import postcss from 'gulp-postcss'
import plumber from 'gulp-plumber'
import stylus from 'gulp-stylus'
import sourcemaps from 'gulp-sourcemaps'
import cleancss from 'gulp-clean-css'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import util from 'gulp-util'
import imagemin from 'gulp-imagemin'
import jshint from 'gulp-jshint'
import notify from 'gulp-notify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import watchify from 'watchify'
import browserify from 'browserify'
// import coffeeify from 'coffeeify'
import babelify from 'babelify'
import axis from 'axis'
import rupture from 'rupture'
import autoprefixer from 'autoprefixer'
import lost from 'lost'
import del from 'del'
import path from 'path'

import bs from 'browser-sync'
const browserSync = bs.create();
const reload = browserSync.reload;

// --------------------------------------------------- Paths
var config = {
  root: {
    src: './src',
    dest: './public'
  },
  css: {
    src: 'stylus',
    infile: 'main',
    dest: 'css',
    outfile: 'main',
    ext: 'styl'
  },
  js: {
    src: 'js',
    infile: 'main',
    dest: 'js',
    outfile: 'app',
    ext: 'js'
  },
  images: {
    src: 'img',
    dest: 'img',
    ext: 'jpg,png,svg,gif'
  },
  fonts: {
    src: 'fonts',
    dest: 'fonts',
    ext: 'eot,svg,ttf,woff,woff2'
  },
  production: !!util.env.production,
  devurl: 'http://localhost:8080'
};

var paths = {
  styles: {
    src: path.join(config.root.src, config.css.src, config.css.infile + '.' + config.css.ext),
    dir: path.join(config.root.src, config.css.src, '/**/*.' + config.css.ext),
    dest: path.join(config.root.dest, config.css.dest)
  },
  scripts: {
    src: path.join(config.root.src, config.js.src, '/**/*.'+ config.js.ext),
    dest: path.join(config.root.dest, config.js.dest)
  },
  images: {
    src: path.join(config.root.src, config.images.src, '/**/*.{' + config.images.ext + '}'),
    dest: path.join(config.root.dest, config.images.dest)
  },
  fonts: {
    src: path.join(config.root.src, config.fonts.src, '/**/*.{' + config.fonts.ext + '}'),
    dest: path.join(config.root.dest, config.fonts.dest)
  }
};

// ---------------------------------------- Helper Functions

// Handle errors
function notifyOnError(err) {
  notify.onError({
    title: 'Error',
    message: "Error: <%= error.message %>"
  })(err);
  this.emit('end');
}

// Use plumber automatically
gulp.plumbedSrc = function () {
  return gulp.src.apply(gulp, arguments)
    .pipe(plumber({ errorHandler: notifyOnError }));
};

// ---------------------------------------------- Gulp Tasks

// Clean the build directory
export const clean = () => del([config.root.dest]);

// Optimize Images
export const buildImages = () =>
  gulp.plumbedSrc(paths.images.src, {since: gulp.lastRun('buildImages')})
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(notify({ title: 'Images', message: 'Images task complete' }));

export const buildFonts = () =>
  gulp.plumbedSrc(paths.fonts.src, {since: gulp.lastRun('buildFonts')})
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(notify({ title: 'Fonts', message: 'Fonts task complete' }));

// Compile Stylus
export const buildStyles = () =>
  gulp.plumbedSrc(paths.styles.src)
    .pipe(!config.production ? sourcemaps.init() : util.noop())
    .pipe(stylus({use: [axis(), rupture()]}))
    .pipe(postcss([
      lost(),
      autoprefixer({ browsers: ['last 2 versions']})
    ]))
    .pipe(!config.production ? sourcemaps.write() : util.noop())
    .pipe(config.production ? cleancss() : util.noop())
    .pipe(rename(config.css.outfile + '.css'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(notify({ title: 'Styles', message: 'Styles task complete' }))
    .pipe(browserSync.stream());

// Lint JavaScript
export const lintScripts = () =>
  gulp.src(paths.scripts.src, {since: gulp.lastRun('lintScripts')})
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    // Un-comment to fail on errors and warnings
    // .pipe(jshint.reporter('fail'))
    .pipe(notify({ title: 'JSHint', message: 'JSHint Passed' }));

// ---------------------------------------------- Browserify

// Browserify bundler
var bundler = browserify({
    entries: [path.join(config.root.src, config.js.src, config.js.infile + '.' + config.js.ext)],
    debug: !config.production,
    cache: {},
    packageCache: {},
    // for watchify - unecessary?
    // fullPaths: true
});

// Add transformations here
// bundler.transform(coffeeify);
bundler.transform(babelify);

// Build JavaScript using Browserify
export const buildScripts = () =>
  bundler
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    // loads map from browserify file
    .pipe(!config.production ? sourcemaps.init({loadMaps: true}) : util.noop())
    // writes .map file
    .pipe(!config.production ? sourcemaps.write('./') : util.noop())
    .pipe(config.production ? uglify() : util.noop())
    .pipe(rename(config.js.outfile + '.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(notify({ title: 'Scripts', message: 'Scripts task complete' }));

// Build JavaScript using Watchify
export const watchScripts = () => {
  var watcher = watchify(bundler);

  watcher.on('update', rebundle);

  let rebundle = () =>
    watcher.bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      // loads map from browserify file
      .pipe(sourcemaps.init({loadMaps: true}))
      // writes .map file
      .pipe(sourcemaps.write('./'))
      .pipe(rename(config.js.outfile + '.js'))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(notify({ title: 'Scripts', message: 'Scripts task complete' }));

  return rebundle();
};

// --------------------------------------------- Build Tasks

// Build everything
export const build =
  config.production ?
                   gulp.series(clean, gulp.parallel(buildStyles, buildScripts, buildImages, buildFonts)) :
                   gulp.series(clean, gulp.parallel(buildStyles, gulp.series(lintScripts, buildScripts), buildImages, buildFonts));

// Watch the src directories for changes and rebuild
export const watchDev = () => {
  gulp.watch(paths.styles.dir, buildStyles);
  gulp.watch(paths.scripts.src, watchScripts);
  gulp.watch(paths.images.src, buildImages);
  gulp.watch(paths.fonts.src, buildFonts);
};

// Run BrowserSync through local server
export const serve = () => {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch(paths.styles.dir, buildStyles);
  gulp.watch(paths.scripts.src, gulp.series(lintScripts, watchScripts)).on('change', reload);
  gulp.watch(paths.images.src, buildImages).on('change', reload);
  gulp.watch(paths.fonts.src, buildFonts).on('change', reload);

  // Reload page on PHP change
  gulp.watch("./**/*.php").on('change', reload);
};

export const dev = gulp.series(build, serve);

// --------------------------------------- Default Gulp Task
export default dev;
