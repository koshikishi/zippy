'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
var server = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var htmlmin = require('gulp-htmlmin');
var del = require('del');

// Компиляция файлов *.css из *.scss с автопрефиксером и минификацией
function css() {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('scss-resets').includePaths
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
}

// Запуск сервера Browsersync
function server() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', css);
  gulp.watch('source/img/icon-*.svg', gulp.series(gulp.parallel(sprite, html), refresh));
  gulp.watch('source/*.html', gulp.series(html, refresh));
}

// Сжатие файлов изображений
function img() {
  return gulp.src('source/img/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
}

// Сборка SVG-спрайта
function sprite() {
  return gulp.src('source/img/icon-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Минификация файлов *.html
function html() {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'));
}

// Копирование файлов в папку build
function copy() {
  return gulp.src([
      'source/fonts/**/*.{woff,woff2}',
      'source/img/**',
      'source/*.ico'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
}

// Удаление файлов в папке build перед копированием
function clean() {
  return del('build');
}

// Создание сборки проекта
var build = gulp.series(clean, copy, sprite, gulp.parallel(css, html));

// Автообновление страницы
function refresh(done) {
  server.reload();
  done();
}

// Создание сборки проекта и запуск сервера Browsersync
// var start = gulp.series(build, server);

// Объявление задач
exports.css = css;
exports.server = server;
exports.img = img;
exports.sprite = sprite;
exports.html = html;
exports.copy = copy;
exports.clean = clean;
exports.build = build;
exports.refresh = refresh;
// exports.start = start;
