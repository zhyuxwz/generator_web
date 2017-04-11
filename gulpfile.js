var gulp         = require('gulp');
var gutil        = require('gulp-util');
var uglify       = require('gulp-uglify');
var watchPath    = require('gulp-watch-path');
var combiner     = require('stream-combiner2');
var sourcemaps   = require('gulp-sourcemaps');
var minifycss    = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sass         = require('gulp-ruby-sass');
var imagemin     = require('gulp-imagemin');
var postcss      = require('gulp-postcss');
var px2rem       = require('postcss-px2rem');


var handlebars = require('gulp-handlebars');
var wrap       = require('gulp-wrap');
var declare    = require('gulp-declare');

var handleError = function (err) {
  var colors = gutil.colors;
  console.log('\n');
  gutil.log(colors.red('Error!'));
  gutil.log('fileName: ' + colors.red(err.fileName));
  gutil.log('lineNumber: ' + colors.red(err.lineNumber));
  gutil.log('message: ' + err.message);
  gutil.log('plugin: ' + colors.yellow(err.plugin))
};

gulp.task('watchjs', function () {
  gulp.watch('src/js/**/*.js', function (event) {
    var paths = watchPath(event, 'src/', 'dist/');
    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);

    var combined = combiner.obj([
      gulp.src(paths.srcPath),
      sourcemaps.init(),
      uglify(),
      sourcemaps.write('./'),
      gulp.dest(paths.distDir)
    ]);

    combined.on('error', handleError)
  })
});

gulp.task('uglifyjs', function () {
  var combined = combiner.obj([
    gulp.src('src/js/**/*.js'),
    sourcemaps.init(),
    uglify(),
    sourcemaps.write('./'),
    gulp.dest('dist/js/')
  ]);
  combined.on('error', handleError)
});


gulp.task('watchcss', function () {
  gulp.watch('src/css/**/*.css', function (event) {
    var paths = watchPath(event, 'src/', 'dist/');

    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);

    gulp.src(paths.srcPath)
      .pipe(sourcemaps.init())
      .pipe(autoprefixer({
        browsers: 'last 2 versions'
      }))
      .pipe(minifycss())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.distDir))
  })
});

gulp.task('minifycss', function () {
  gulp.src('src/css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: 'last 2 versions'
    }))
    .pipe(minifycss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css/'))
});

gulp.task('watchsass', function () {
  var processors = [px2rem({remUnit: 64})];
  gulp.watch('src/sass/**/*', function (event) {
    var paths = watchPath(event, 'src/sass/', 'dist/css/');
    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);
    sass(paths.srcPath, {compass: true, sourcemap: true})
      .on('error', function (err) {
        console.error('Error!', err.message);
      })
      .pipe(postcss(processors))
      .pipe(sourcemaps.init())
      .pipe(autoprefixer({
        browsers: 'last 2 versions'
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.distDir))
  })
});

gulp.task('sasscss', function () {
  var processors = [px2rem({remUnit: 64})];
  sass('src/sass/', {compass: true, sourcemap: true})
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe(postcss(processors))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: 'last 2 versions'
    }))

    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('watchimage', function () {
  gulp.watch('src/images/**/*', function (event) {
    var paths = watchPath(event, 'src/', 'dist/');

    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);

    gulp.src(paths.srcPath)
      .pipe(imagemin({
        progressive: true
      }))
      .pipe(gulp.dest(paths.distDir))
  })
});

gulp.task('image', function () {
  gulp.src('src/images/**/*')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('watchcopy', function () {
  gulp.watch('src/fonts/**/*', function (event) {
    var paths = watchPath(event, 'src/', 'dist/');

    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);

    gulp.src(paths.srcPath)
      .pipe(gulp.dest(paths.distDir))
  })
});

gulp.task('copy', function () {
  gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'))
});

gulp.task('watchtemplates', function () {
  gulp.watch('src/templates/**/*', function (event) {
    var paths = watchPath(event, 'src/', 'dist/');

    gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
    gutil.log('Dist ' + paths.distPath);

    var combined = combiner.obj([
      gulp.src(paths.srcPath),
      handlebars({
        // 3.0.1
        handlebars: require('handlebars')
      }),
      wrap('Handlebars.template(<%= contents %>)'),
      declare({
        namespace: 'S.templates',
        noRedeclare: true
      }),
      gulp.dest(paths.distDir)
    ]);
    combined.on('error', handleError)
  })
});

gulp.task('templates', function () {
  gulp.src('src/templates/**/*')
    .pipe(handlebars({
      // 3.0.1
      handlebars: require('handlebars')
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'S.templates',
      noRedeclare: true
    }))
    .pipe(gulp.dest('dist/templates'))
});

gulp.task('default', [
    // build
    'uglifyjs', 'sasscss', 'image', 'copy', 'templates',
    // watch
    'watchjs', 'watchcss', 'watchsass', 'watchimage', 'watchcopy', 'watchtemplates'
  ]
);
