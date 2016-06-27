'use strict';

var gulp         = require('gulp');
var browserSync  = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var jade         = require('gulp-jade');
var less         = require('gulp-less');
var path         = require('path');
var del          = require('del');
var runSequence  = require('run-sequence');
var fs           = require("fs");
var awspublish   = require('gulp-awspublish');
var _            = require('lodash');


var publisher = awspublish.create({
  region: 'eu-west-1',
  params: {
    Bucket: 'sassgg'
  },
  accessKeyId: 'AKIAIRVYI5GXMXHK5LHQ',
  secretAccessKey: '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'
});


// var aws = JSON.parse(fs.readFileSync('./aws.json')); // reading aws config file
// var publisher = awspublish.create(aws);


// Start browserSync server
gulp.task('browserSync', function() {
  browserSync.init({
    server: "dist",
    open: false
  });
});

// LESS
gulp.task('less', function() {
  return gulp.src('app/less/main.less')
    .pipe(less()) // Passes it through a gulp-sass
    .pipe(autoprefixer('last 10 versions', 'ie 9')) // autoprefixer
    .pipe(gulp.dest('dist/assets/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// JS
gulp.task('js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(gulp.dest('dist/assets/js/'))
    .pipe(browserSync.reload({ stream: true }))
});

// Root
// gulp.task('root', function() {
//   return gulp
//     .src(['app/CNAME', 'app/images/favicon/favicon.ico*'])
//     .pipe( gulp.dest('dist/') );
// });

// Templates
gulp.task('templates', function() {    
  var host = '/assets/';
  return gulp.src(['app/templates/index.jade', 'app/templates/*/*.jade', 'app/templates/*/*/*.jade', '!app/templates/includes/**'])
    .pipe(jade({
      pretty: true,
      locals: {
        STATIC_URL: host,
        _: _
      }
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }))
});

// Watchers
var reload = function(){
    console.log('reload');
    browserSync.reload();
};

gulp.task('watch', function() {
    gulp.watch('app/less/**/*.{less,css}', ['less']);
    gulp.watch('app/js/*.js', ['js']);
    gulp.watch('app/templates/**/*.jade', ['templates']);
})

// Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg|pdf)')
  .pipe(gulp.dest('dist/assets/images'))
});

// Cleanup Extraneous Files
gulp.task('clean:dist', function(callback) {
  return del(['dist/**/*', '!dist/assets/images', '!dist/assets/images/**/*'], function(){
    cache.clearAll(callback);
  });
});

// Deploy to s3

var headers = { 'Cache-Control': 'max-age=315360000, no-transform, public' };

gulp.task('deploy', function () {
  return gulp.src("dist/**/*")
    .pipe(publisher.publish())
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
});









//////////////////////////////////////////////////////



// Run and develop
gulp.task('default', function(callback) {
  runSequence(
    'clean:dist',
    ['js', 'less', 'images', 'templates', 'browserSync', 'watch'],
    callback
  )
});

// Clean, Build, and Publish to Github Pages
gulp.task('publish', function(callback) {
  runSequence(
    'clean:dist',
    ['js', 'less', 'images', 'templates'],
    'deploy',
    callback
  )
    
});