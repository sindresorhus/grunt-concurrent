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
		var taskColors = ["blue","magenta","yellow","green","red","cyan","gray"];
		if(opts.logConcurrentOutput && opts.logConcurrentOutput.showTask && opts.logConcurrentOutput.showTask.colors) {
			taskColors = opts.logConcurrentOutput.showTask.colors;
		}
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
				if (opts.logConcurrentOutput.showTask) {
					var color;
					if(taskColors.length) { // task colors is a non-empty array => retrieving next available color
						color = taskColors.shift();
					} else if(taskColors[task]) { // task colors is a map[taskName]:color containing current task
						color = taskColors[task];
					} else if(typeof taskColors === 'function') { // task colors is a function, resolving color by task name
						color = taskColors(task);
					} else {
						color = null;
					}
					if(color && !chalk[color]) {
						grunt.log.error("No chalk color found corresponding to ["+color+"] => falling back to uncolored task ["+task+"]");
						color = null;
					}
					var colorizeFn = color ? chalk[color] : function(s) { return s };//use an available color or none if more tasks then colors available
					var maxLength = opts.logConcurrentOutput.showTask.maxLength || maxTaskLength;//use the longest task name as maximum, or the maximum provided by logConcurrentOutput.showTask.maxLength
					var paddingSpaces = (task.length > maxLength ? 0 : maxLength-task.length) + '[] '.length; //let output from all tasks be aligned
					padString = colorizeFn('['+task.slice(0,maxLength)+']')+(' '.repeat(paddingSpaces));
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
