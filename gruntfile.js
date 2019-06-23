'use strict';
const supportsColor = require('supports-color');

module.exports = grunt => {
	grunt.initConfig({
		concurrent: {
			test: [
				'test1',
				'test2',
				'test3'
			],
			testSequence: [
				'test4', [
					'test5',
					'test6'
				]
			],
			testargs: [
				'testargs1',
				'testargs2'
			],
			log: {
				options: {
					logConcurrentOutput: true
				},
				tasks: [
					'nodemon',
					'watch'
				]
			},
			colors: [
				'colorcheck'
			],
			indentTrue: {
				options: {
					indent: true
				},
				tasks: [
					'testIndent'
				]
			},
			indentFalse: {
				options: {
					indent: false
				},
				tasks: [
					'testIndent'
				]
			},
			indentFalseConcurrentOutput: {
				options: {
					logConcurrentOutput: true,
					indent: false
				},
				tasks: [
					'testIndent'
				]
			},
			indentDefault: [
				'testIndent'
			]
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
			test: [
				'test/tmp'
			]
		},
		watch: {
			scripts: {
				files: [
					'tasks/*.js'
				],
				tasks: [
					'default'
				]
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

	grunt.registerTask('test1', () => {
		console.log('test1');
		grunt.file.write('test/tmp/1');
	});

	grunt.registerTask('test2', function () {
		const cb = this.async();
		setTimeout(() => {
			console.log('test2');
			grunt.file.write('test/tmp/2');
			cb();
		}, 1000);
	});

	grunt.registerTask('test3', () => {
		console.log('test3');
		grunt.file.write('test/tmp/3');
	});

	grunt.registerTask('test4', () => {
		console.log('test4');
		grunt.file.write('test/tmp/4');
	});

	grunt.registerTask('test5', () => {
		console.log('test5');
		grunt.file.write('test/tmp/5');
		sleep(1000);
	});

	grunt.registerTask('test6', () => {
		console.log('test6');
		grunt.file.write('test/tmp/6');
	});

	grunt.registerTask('testargs1', () => {
		const args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args1', args);
	});

	grunt.registerTask('testargs2', () => {
		const args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args2', args);
	});

	grunt.registerTask('colorcheck', () => {
		// Writes 'true' or 'false' to the file
		const supports = String(Boolean(supportsColor.stdout));
		grunt.file.write('test/tmp/colors', supports);
	});

	grunt.registerTask('testIndent', () => {
		console.log('indent test output');
	});

	grunt.registerTask('default', [
		'clean',
		'concurrent:test',
		'concurrent:testSequence',
		'simplemocha',
		'clean'
	]);
};

function sleep(milliseconds) {
	const start = new Date().getTime();
	for (let i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}
