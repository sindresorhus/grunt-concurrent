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
		grunt.util.async.forEach(tasks, function (el, next) {
			var command = [ el ],
				args = grunt.option.flags();

			grunt.util.spawn({
				grunt: true,
				args: command.concat(args),
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
