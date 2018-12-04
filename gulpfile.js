var gulp = require('gulp'),
    jsdoc = require("gulp-jsdoc3");

gulp.task('generate', function(){
     return gulp.src("./src/ti-core/*.js")
            .pipe(jsdoc('./api-doc'))
});
gulp.task('watch', function(){
     gulp.watch('./src/ti-core/*.js', ['generate']);
});
gulp.task('default', ['generate']);