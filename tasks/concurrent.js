'use strict';
var lpad = require('lpad');

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var cb = this.async();
		var options = this.options();
		var opts;
		var tasks;

		// Optionally log the task output
		if (options.logConcurrentOutput) {
			opts = { stdio: 'inherit' };
		}

		// Set the tasks based on the config format
		if (this.data.tasks) {
			tasks = this.data.tasks;
		} else {
			tasks = this.data;
		}

		lpad.stdout('    ');
		grunt.util.async.forEach(tasks, function (el, next) {
			grunt.util.spawn({
				grunt: true,
				args: el,
				opts: opts
			}, function (err, result, code) {
				if (err || code > 0) {
					grunt.warn(result.stderr || result.stdout);
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
