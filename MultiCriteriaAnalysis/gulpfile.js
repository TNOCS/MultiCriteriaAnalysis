/// <vs SolutionOpened='default' />
// http://andy-carter.com/blog/a-beginners-guide-to-the-task-runner-gulp
// http://www.smashingmagazine.com/2014/06/11/building-with-gulp/

// Configure gulp scripts
var appName = 'csWebApp';

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

gulp.task('create_release_dist', function() {
    var assets = useref.assets();

    return gulp.src('./public/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('minify_csComp', function() {
    // gulp.src('../../csWeb/csComp/dist/csComp.js')
    //    .pipe(plumber())
    //    .pipe(gulp.dest('public/js/cs'));
    gulp.src('public/js/cs/csComp.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('public/cs/js'));
});

gulp.task('include_js', function() {
    gulp.src('../../csWeb/csComp/includes/js/**/*.*')
        .pipe(debug({
            title: 'include_js:'
        }))
        .pipe(plumber())
        .pipe(gulp.dest('./public/cs/js'));
});

gulp.task('include_css', function() {
    gulp.src('../../csWeb/csComp/includes/css/*.*')
        .pipe(plumber())
        .pipe(gulp.dest('./public/cs/css'));
});

gulp.task('include_images', function() {
    gulp.src('../../csWeb/csComp/includes/images/*.*')
        .pipe(plumber())
        .pipe(gulp.dest('./public/cs/images/'));
});


gulp.task('watch', function() {
    gulp.watch('../../csWeb/csComp/js/**/*.js', ['built_csComp']);
    gulp.watch('../../csWeb/csComp/js/**/*.d.ts', ['built_csComp.d.ts']);
    gulp.watch('../../csWeb/csComp/**/*.tpl.html', ['create_templateCache']);
    gulp.watch('../../csWeb/csComp/includes/**/*.css', ['include_css']);
    gulp.watch('../../csWeb/csComp/includes/**/*.js', ['include_js']);
    gulp.watch('../../csWeb/csComp/includes/images/*.*', ['include_images']);
});

gulp.task('default', ['create_templateCache', 'built_csComp', 'built_csComp.d.ts', 'include_css', 'include_js', 'include_images', 'watch']);
