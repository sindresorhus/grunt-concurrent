'use strict';
var os = require('os');
var padStdio = require('pad-stdio');
var async = require('async');
var cpCache = [];

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var cb = this.async();
		var opts = this.options({
			limit: Math.max((os.cpus().length || 1) * 2, 2)
		});
		var tasks = this.data.tasks || this.data;
		var flags = grunt.option.flags();

		if (opts.limit < tasks.length) {
			grunt.log.oklns(
				'Warning: There are more tasks than your concurrency limit. After ' +
				'this limit is reached no further tasks will be run until the ' +
				'current tasks are completed. You can adjust the limit in the ' +
				'concurrent task options'
			);
		}

		padStdio.stdout('    ');

		async.eachLimit(tasks, opts.limit, function (task, next) {
			var cp = grunt.util.spawn({
				grunt: true,
				args: [task].concat(flags),
				opts: {
					stdio: ['ignore', 'pipe', 'pipe']
				}
			}, function (err, result) {
				if (!opts.logConcurrentOutput) {
					grunt.log.writeln('\n' + result.stdout + result.stderr);
				}

				next(err);
			});

			if (opts.logConcurrentOutput) {
				cp.stdout.pipe(process.stdout);
				cp.stderr.pipe(process.stderr);
			}

			cpCache.push(cp);
		}, function (err) {
			if (err) {
				grunt.warn(err);
			}

			padStdio.stdout();
			cb();
		});
	});
};

// make sure all child processes are killed when grunt exits
process.on('exit', function () {
	cpCache.forEach(function (el) {
		el.kill('SIGKILL');
	});
});
