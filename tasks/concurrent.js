'use strict';
var lpad = require('lpad');
var async = require('async');
var MemoryStream = require('memorystream');
var cpCache = [];

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var spawnOptions;
		var cb = this.async();
		var options = this.options({
			limit: Math.max(require('os').cpus().length, 2)
		});
		// Set the tasks based on the config format
		var tasks = this.data.tasks || this.data;

		// Warning if there are too many tasks to execute within the given limit
		if (options.limit < tasks.length) {
			grunt.log.oklns(
				'Warning: There are more tasks than your concurrency limit. After ' +
				'this limit is reached no further tasks will be run until the ' +
				'current tasks are completed. You can adjust the limit in the ' + 
				'concurrent task options'
			);
		}

		// Optionally log the task output
		if (options.logConcurrentOutput) {
			spawnOptions = { stdio: 'inherit' };
		}

		lpad.stdout('    ');
		async.eachLimit(tasks, options.limit, function (task, next) {
			var cp = grunt.util.spawn({
				grunt: true,
				args: [task].concat(grunt.option.flags()),
				opts: spawnOptions
			}, function() {});

			// Buffer the output.  We buffer into a MemoryStream so that
			// stdout and stderr will be correctly interleaved.  See
			// http://stackoverflow.com/questions/15339379/node-js-spawning-a-child-process-interactively-with-separate-stdout-and-stderr-s
			var memStream = new MemoryStream(null, {
			    readable : false
			});

			cp.stdout.pipe(memStream);
			cp.stderr.pipe(memStream);
			cp.on('close', function (code) {
				grunt.log.writeln(memStream.toString());
				if (code > 0) {
					next(new Error('Task "' + task + '" failed.'));
				} else {
					next();
				}
			});

			cpCache.push(cp);
		}, function (err) {
			lpad.stdout();
			if (err) {
				grunt.warn(err.message);
			}
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
