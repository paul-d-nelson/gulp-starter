// =========================================================
// gulpfile.js
// =========================================================

var gulp          = require('gulp'),
    rename        = require('gulp-rename'),
    postcss       = require('gulp-postcss'),
    plumber       = require('gulp-plumber'),
    stylus        = require('gulp-stylus'),
    sourcemaps    = require('gulp-sourcemaps'),
    cleancss      = require('gulp-clean-css'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    util          = require('gulp-util'),
    imagemin      = require('gulp-imagemin'),
    jshint        = require('gulp-jshint'),
    notify        = require('gulp-notify'),
    source        = require('vinyl-source-stream'),
    buffer        = require('vinyl-buffer'),
    watchify      = require('watchify'),
    browserify    = require('browserify'),
    axis          = require('axis'),
    rupture       = require('rupture'),
    // pmixins       = require('pauls-mixins'),
    autoprefixer  = require('autoprefixer'),
    lost          = require('lost'),
    del           = require('del'),
    path          = require('path'),
    browserSync   = require('browser-sync').create(),
    reload        = browserSync.reload;

// --------------------------------------------------- Paths
var config = {
  root: {
    src: './src',
    dest: './public'
  },
  css: {
    src: 'stylus',
    dest: 'css',
    ext: 'styl'
  },
  js: {
    src: 'js',
    dest: 'js',
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
  devurl: 'http://localhost'
};

var paths = {
  styles: {
    src: path.join(config.root.src, config.css.src, 'main.' + config.css.ext),
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
gulp.task('clean', () => {
  return del([config.root.dest]);
});

// Optimize Images
gulp.task('images', () => {
  return gulp.plumbedSrc(paths.images.src, {since: gulp.lastRun('images')})
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(notify({ title: 'Images', message: 'Images task complete' }));
});

gulp.task('fonts', () => {
  return gulp.plumbedSrc(paths.fonts.src, {since: gulp.lastRun('fonts')})
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(notify({ title: 'Fonts', message: 'Fonts task complete' }));
});

// Compile Stylus
gulp.task('styles', () => {
  return gulp.plumbedSrc(paths.styles.src)
    .pipe(!config.production ? sourcemaps.init() : util.noop())
    // .pipe(stylus({use: [axis(), rupture(), pmixins()]}))
    .pipe(stylus({use: [axis(), rupture()]}))
    .pipe(postcss([
      lost(),
      autoprefixer({ browsers: ['last 2 versions', '> 5%']})
    ]))
    .pipe(!config.production ? sourcemaps.write() : util.noop())
    .pipe(config.production ? cleancss() : util.noop())
    .pipe(rename('main.css'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(notify({ title: 'Styles', message: 'Styles task complete' }))
    .pipe(browserSync.stream());
});

// Lint JavaScript
gulp.task('jshint', () => {
  return gulp.src(paths.scripts.src, {since: gulp.lastRun('jshint')})
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    // .pipe(jshint.reporter('fail'))
    .pipe(notify({ title: 'JSHint', message: 'JSHint Passed' }));
});

// Concatenate and minify JavaScript
gulp.task('js:concat', () => {
  return gulp.plumbedSrc(paths.scripts.src)
    .pipe(concat('app.js'))
    .pipe(config.production ? uglify() : util.noop())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(notify({ title: 'Scripts', message: 'Scripts task complete' }));
});

// ---------------------------------------------- Browserify

// Browserify bundler
var bundler = browserify({
    entries: [path.join(config.root.src, config.js.src, '/main.' + config.js.ext)],
    debug: !config.production,
    cache: {},
    packageCache: {},
    // fullPaths: true // for watchify
});

// Add transformations here
// bundler.transform(coffeeify);

// Build JavaScript using Browserify
gulp.task('js', function() {
  return bundler
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(!config.production ? sourcemaps.init({loadMaps: true}) : util.noop()) // loads map from browserify file
    .pipe(!config.production ? sourcemaps.write('./') : util.noop()) // writes .map file
    .pipe(config.production ? uglify() : util.noop())
    .pipe(rename('app.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(notify({ title: 'Scripts', message: 'Scripts task complete' }));
});

// Build JavaScript using Watchify
gulp.task('watchify', () => {
  var watcher = watchify(bundler);

  watcher.on('update', rebundle);

  function rebundle() {
    return watcher.bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(rename('app.js'))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(notify({ title: 'Scripts', message: 'Scripts task complete' }));
  }

  return rebundle();
});

// --------------------------------------------- Build Tasks

// Build everything
gulp.task('build', config.production ?
                   gulp.series('clean', gulp.parallel('styles', 'js', 'images', 'fonts')) :
                   gulp.series('clean', gulp.parallel('styles', gulp.series('jshint', 'js'), 'images', 'fonts')));

// Watch the src directories for changes and rebuild
gulp.task('watch', () => {
  gulp.watch(paths.styles.dir, gulp.series('styles'));
  gulp.watch(paths.scripts.src, gulp.series('watchify'));
  gulp.watch(paths.images.src, gulp.series('images'));
  gulp.watch(paths.fonts.src, gulp.series('fonts'));
});

// Run BrowserSync through local server
gulp.task('serve', () => {
  browserSync.init({
    proxy: config.devurl
  });
  gulp.watch(paths.styles.dir, gulp.series('styles'));
  gulp.watch(paths.scripts.src, gulp.series('jshint', 'watchify')).on('change', reload);
  gulp.watch(paths.images.src, gulp.series('images')).on('change', reload);
  gulp.watch(paths.fonts.src, gulp.series('fonts')).on('change', reload);

  // Reload page on PHP change
  gulp.watch("./**/*.php").on('change', reload);
});

// --------------------------------------- Default Gulp Task
gulp.task('default', gulp.series('build', 'serve'));
