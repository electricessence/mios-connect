const
	gulp = require("gulp"),
    babel = require("gulp-babel");

gulp.task("ES5",function(){
	return gulp
		.src('./Mios/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./ES5/'))
});
