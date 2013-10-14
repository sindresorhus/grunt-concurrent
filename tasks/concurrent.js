'use strict';
var lpad = require('lpad');
var cpCache = [];

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var spawnOptions;
		var cb = this.async();
		var options = this.options({
			limit: require('os').cpus().length
		});
		// Set the tasks based on the config format
		var tasks = this.data.tasks || this.data;
		
		// Warn the user if limit is 1, as this case is uncommon and not very useful
		if (options.limit === 1) {
			grunt.warn("limit is currently set to 1. Concurrent will probably not work as intended! Check your number of available CPUs.");
		}

		// Optionally log the task output
		if (options.logConcurrentOutput) {
			spawnOptions = { stdio: 'inherit' };
		}

		lpad.stdout('    ');
		grunt.util.async.forEachLimit(tasks, options.limit, function (task, next) {
			var cp = grunt.util.spawn({
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

			cpCache.push(cp);
		}, function () {
			lpad.stdout();
			cb();
		});
	});
};

// make sure all child processes are killed when grunt exits
process.on('exit', function () {
	cpCache.forEach(function (el) {
		el.kill();
	});
});
