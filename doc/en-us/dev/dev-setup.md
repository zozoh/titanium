# Gulp & JsDoc

```bash
npm install --save-dev gulp
npm install --save-dev gulp-rev gulp-rev-replace gulp-useref 
npm install --save-dev gulp-filter gulp-uglify gulp-csso 
npm install --save-dev gulp-jsdoc3   # !!! must gulp-jsdoc3
```

- @see also [gulp-jsdoc3](https://www.npmjs.com/package/gulp-jsdoc3)

run

```
.\node_modules\.bin\gulp watch
jsdoc .\src\ti-core\ -d api-doc -c conf/jsdoc.json
```

```js
// gulpfile.js
var gulp = require('gulp'),
    jsdoc = require("gulp-jsdoc3");

gulp.task('gen_doc', function(cb){
    gulp.src("src/ti-core/*.js")
        .pipe(jsdoc(cb))
});
gulp.task('watch', function(){
     gulp.watch('./src/ti-core/*.js', ['gen_doc']);
});
gulp.task('default', ['gen_doc']);
```