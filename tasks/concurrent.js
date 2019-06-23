'use strict';
const os = require('os');
const padStream = require('pad-stream');
const async = require('async');
const arrify = require('arrify');
const indentString = require('indent-string');

const subprocesses = [];

module.exports = grunt => {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		const done = this.async();

		const options = this.options({
			limit: Math.max((os.cpus().length || 1) * 2, 2),
			indent: true
		});

		const tasks = this.data.tasks || this.data;
		const flags = grunt.option.flags();

		if (
			!flags.includes('--no-color') &&
			!flags.includes('--no-colors') &&
			!flags.includes('--color=false')
		) {
			// Append the flag so that support-colors won't return false
			// See issue #70 for details
			flags.push('--color');
		}

		if (options.limit < tasks.length) {
			grunt.log.oklns(
				'Warning: There are more tasks than your concurrency limit. After this limit is reached no further tasks will be run until the current tasks are completed. You can adjust the limit in the concurrent task options'
			);
		}

		async.eachLimit(tasks, options.limit, (task, next) => {
			const subprocess = grunt.util.spawn({
				grunt: true,
				args: arrify(task).concat(flags),
				opts: {
					stdio: [
						'ignore',
						'pipe',
						'pipe'
					]
				}
			}, (error, result) => {
				if (!options.logConcurrentOutput) {
					let output = result.stdout + result.stderr;
					if (options.indent) {
						output = indentString(output, 4);
					}

					grunt.log.writeln(`\n${output}`);
				}

				next(error);
			});

			if (options.logConcurrentOutput) {
				let subStdout = subprocess.stdout;
				let subStderr = subprocess.stderr;
				if (options.indent) {
					subStdout = subStdout.pipe(padStream(4));
					subStderr = subStderr.pipe(padStream(4));
				}

				subStdout.pipe(process.stdout);
				subStderr.pipe(process.stderr);
			}

			subprocesses.push(subprocess);
		}, error => {
			if (error) {
				grunt.warn(error);
			}

			done();
		});
	});
};

function cleanup() {
	for (const subprocess of subprocesses) {
		subprocess.kill('SIGKILL');
	}
}

// Make sure all subprocesses are killed when grunt exits
process.on('exit', cleanup);
process.on('SIGINT', () => {
	cleanup();
	process.exit();
});
