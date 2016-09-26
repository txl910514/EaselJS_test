var gulp=require('gulp'),
  connect = require('gulp-connect');

gulp.task('connect', function () {
  connect.server({
    root: 'app',
    livereload: true
  });
});

gulp.task('default', ['connect']);