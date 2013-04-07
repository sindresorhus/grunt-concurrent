'use strict';
var lpad = require('lpad');

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var cb = this.async();
		lpad.stdout('    ');
		grunt.util.async.forEach(this.data, function (el, next) {
			grunt.util.spawn({
				grunt: true,
				args: el
			}, function (err, result) {
				if (err) {
					grunt.warn(err);
				}
				grunt.log.writeln('\n' + result.stdout);
				next();
			});
		}, function () {
			lpad.stdout();
			cb();
		});
	});
};
