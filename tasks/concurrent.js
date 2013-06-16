'use strict';
var lpad = require('lpad');

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var spawnOptions;
		var cb = this.async();
		var options = this.options();
		// Set the tasks based on the config format
		var tasks = this.data.tasks || this.data;

		// Optionally log the task output
		if (options.logConcurrentOutput) {
			spawnOptions = { stdio: 'inherit' };
		}

		lpad.stdout('    ');
		grunt.util.async.forEach(tasks, function (task, next) {
			grunt.util.spawn({
				grunt: true,
				args: [task].concat(grunt.option.flags()),
				opts: spawnOptions
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
