'use strict';
var supportsColor = require('supports-color');

module.exports = function (grunt) {
	grunt.initConfig({
		concurrent: {
			test: ['test1', 'test2', 'test3'],
			testSequence: ['test4', ['test5', 'test6']],
			testargs: ['testargs1', 'testargs2'],
			log: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['nodemon', 'watch']
			},
			testLogTaskName: {
			  options: {
			    logConcurrentOutput: {
			      showTask: true
			    }
			  },
			  tasks: ['test1', 'test2', 'test3']
			},
			colors: ['colorcheck']
		},
		simplemocha: {
			test: {
				src: 'test/*.js',
				options: {
					timeout: 6000
				}
			}
		},
		clean: {
			test: ['test/tmp']
		},
		watch: {
			scripts: {
				files: ['tasks/*.js'],
				tasks: ['default']
			}
		},
		nodemon: {
			dev: {
				options: {
					file: 'test/fixtures/server.js'
				}
			}
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-nodemon');

	grunt.registerTask('test1', function () {
		console.log('test1');
		grunt.file.write('test/tmp/1');
	});

	grunt.registerTask('test2', function () {
		var cb = this.async();
		setTimeout(function () {
			console.log('test2');
			grunt.file.write('test/tmp/2');
			cb();
		}, 1000);
	});

	grunt.registerTask('test3', function () {
		console.log('test3');
		grunt.file.write('test/tmp/3');
	});

	grunt.registerTask('test4', function () {
		console.log('test4');
		grunt.file.write('test/tmp/4');
	});

	grunt.registerTask('test5', function () {
		console.log('test5');
		grunt.file.write('test/tmp/5');
		sleep(1000);
	});

	grunt.registerTask('test6', function () {
		console.log('test6');
		grunt.file.write('test/tmp/6');
	});

	grunt.registerTask('testargs1', function () {
		var args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args1', args);
	});

	grunt.registerTask('testargs2', function () {
		var args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args2', args);
	});

	grunt.registerTask('colorcheck', function () {
		// writes 'true' or 'false' to the file
		var supports = String(Boolean(supportsColor));
		grunt.file.write('test/tmp/colors', supports);
	});

	grunt.registerTask('default', [
		'clean',
		'concurrent:test',
		'concurrent:testSequence',
		'concurrent:testLogTaskName',
		'simplemocha',
		'clean'
	]);
};

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}
