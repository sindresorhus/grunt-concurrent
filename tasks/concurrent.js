'use strict';
var os = require('os');
var padStream = require('pad-stream');
var async = require('async');
var arrify = require('arrify');
var indentString = require('indent-string');
var chalk = require('chalk');

var cpCache = [];

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var cb = this.async();
		var opts = this.options({
			limit: Math.max((os.cpus().length || 1) * 2, 2)
		});
		var tasks = this.data.tasks || this.data;
		var maxTaskLength = Math.max.apply(null,(tasks.map(function(task){ return task.length})));
		var colors = ["blue","magenta","yellow","green","red","cyan","gray"];
		var flags = grunt.option.flags();

		if (flags.indexOf('--no-color') === -1 &&
			flags.indexOf('--no-colors') === -1 &&
			flags.indexOf('--color=false') === -1) {
			// append the flag so that support-colors won't return false
			// see issue #70 for details
			flags.push('--color');
		}

		if (opts.limit < tasks.length) {
			grunt.log.oklns(
				'Warning: There are more tasks than your concurrency limit. After ' +
				'this limit is reached no further tasks will be run until the ' +
				'current tasks are completed. You can adjust the limit in the ' +
				'concurrent task options'
			);
		}

		async.eachLimit(tasks, opts.limit, function (task, next) {
			var cp = grunt.util.spawn({
				grunt: true,
				args: arrify(task).concat(flags),
				opts: {
					stdio: ['ignore', 'pipe', 'pipe']
				}
			}, function (err, result) {
				if (!opts.logConcurrentOutput) {
					grunt.log.writeln('\n' + indentString(result.stdout + result.stderr, ' ', 4));
				}

				next(err);
			});

			if (opts.logConcurrentOutput) {
				var padString;
				if (opts.logTaskName) {
					var colorFn = colors.length > 0 ? chalk[colors.shift()] : function(s) { return s };//use an available color or none if more tasks then colors available
					var maxLength = typeof opts.logTaskName === 'number' ?  opts.logTaskName : maxTaskLength;//use the longest task name as maximum, or the maximum provided by logTaskName
					var numSpaces = (task.length > maxLength ? 0 : maxLength-task.length) + 3;//let output from all tasks be aligned
					padString = '['+colorFn(task.slice(0,maxLength))+']'+(' '.repeat(numSpaces));
				} else {
					padString = '    ';
				}

				cp.stdout.pipe(padStream(padString, 1)).pipe(process.stdout);
				cp.stderr.pipe(padStream(padString, 1)).pipe(process.stderr);
			}

			cpCache.push(cp);
		}, function (err) {
			if (err) {
				grunt.warn(err);
			}

			cb();
		});
	});
};

function cleanup() {
	cpCache.forEach(function (el) {
		el.kill('SIGKILL');
	});
}

// make sure all child processes are killed when grunt exits
process.on('exit', cleanup);
process.on('SIGINT', function () {
	cleanup();
	process.exit(); // eslint-disable-line xo/no-process-exit
});
