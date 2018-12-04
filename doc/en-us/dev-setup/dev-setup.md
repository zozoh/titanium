# Gulp & JsDoc

```bash
npm install --save-dev gulp
npm install --save-dev gulp-rev gulp-rev-replace gulp-useref 
npm install --save-dev gulp-filter gulp-uglify gulp-csso 
npm install --save-dev gulp-jsdoc3   # !!! must gulp-jsdoc3
```

run

```
.\node_modules\.bin\gulp
jsdoc .\src\ti-core\ -d api-doc -c conf/jsdoc.json
```