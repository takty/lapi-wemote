/* eslint-disable no-undef */
'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')({ pattern: ['gulp-*'] });


gulp.task('js-min', () => gulp.src(['src/**/*.js', '!src/**/*.min.js'], { sourcemaps: true })
	.pipe($.plumber())
	.pipe($.terser())
	.pipe($.rename({ extname: '.min.js' }))
	.pipe(gulp.dest('./dist', { sourcemaps: '.' }))
);

gulp.task('js-copy', () => gulp.src(['src/**/*.min.js'])
	.pipe($.plumber())
	.pipe($.changed('./dist'))
	.pipe(gulp.dest('./dist'))
);

gulp.task('js', gulp.parallel('js-min', 'js-copy'));

gulp.task('sass', () => gulp.src(['src/**/*.scss'], { sourcemaps: true })
	.pipe($.plumber({
		errorHandler: function (err) {
			console.log(err.messageFormatted);
			this.emit('end');
		}
	}))
	.pipe($.dartSass({ outputStyle: 'compressed' }))
	.pipe($.autoprefixer({ remove: false }))
	.pipe($.rename({ extname: '.min.css' }))
	.pipe(gulp.dest('./dist', { sourcemaps: '.' }))
);

gulp.task('html', () => gulp.src(['src/**/*.html'])
	.pipe($.plumber())
	.pipe($.changed('./dist'))
	.pipe(gulp.dest('./dist'))
);

gulp.task('watch', () => {
	gulp.watch('src/**/*.js', gulp.series('js'));
	gulp.watch('src/**/*.scss', gulp.series('sass'));
	gulp.watch('src/**/*.html', gulp.series('html'));
});

gulp.task('build', gulp.parallel('js', 'sass', 'html'));

gulp.task('default', gulp.series('build', 'watch'));
