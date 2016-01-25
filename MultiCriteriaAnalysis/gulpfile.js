/// <vs SolutionOpened='default' />
// http://andy-carter.com/blog/a-beginners-guide-to-the-task-runner-gulp
// http://www.smashingmagazine.com/2014/06/11/building-with-gulp/

// Configure gulp scripts
var appName = 'mca';

var gulp = require('gulp'),
    insert = require('gulp-insert'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    rename = require('gulp-rename'),
    debug = require('gulp-debug'),
    cache = require('gulp-cached'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch'),
    templateCache = require('gulp-angular-templatecache');

gulp.task('create_dist', function() {
    var assets = useref.assets();

    return gulp.src('./public/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

// gulp.task('create_release_dist', function() {
//     var assets = useref.assets();

//     return gulp.src('./public/*.html')
//         .pipe(assets)
//         .pipe(gulpif('*.js', uglify()))
//         .pipe(gulpif('*.css', minifyCss()))
//         .pipe(assets.restore())
//         .pipe(useref())
//         .pipe(gulp.dest('dist'));
// });

gulp.task('watch', function() {
    // gulp.watch('../../csWeb/csComp/js/**/*.js', ['built_csComp']);
});

gulp.task('default', ['watch']);
