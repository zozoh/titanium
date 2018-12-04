var gulp = require('gulp'),
    jsdoc = require("gulp-jsdoc3"),
    config = require("./conf/jsdoc.json");

gulp.task('gen_doc', function(cb){
    gulp.src("src/ti-core/*.js")
        .pipe(jsdoc(config, cb))
});
gulp.task('watch', function(){
    gulp.watch([
        './src/ti-core/*.js',
        './src/ti-doc-static/**/*.css',
        './conf/jsdoc.json',
    ], ['gen_doc']);
});
gulp.task('default', ['gen_doc']);



