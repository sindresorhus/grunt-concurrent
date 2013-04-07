'use strict';
module.exports = function (grunt) {
	grunt.initConfig({
		concurrent: {
			test: ['test1', 'test2', 'test3']
		},
		simplemocha: {
			test: {
				src: 'test/*.js'
			}
		},
		clean: {
			test: ['test/tmp']
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-simple-mocha');

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

	grunt.registerTask('default', [
		'clean',
		'concurrent',
		'simplemocha',
		'clean'
	]);
};
