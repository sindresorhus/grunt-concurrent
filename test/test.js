'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var pathExists = require('path-exists');

describe('concurrent', function () {
	it('runs grunt tasks successfully', function () {
		assert(pathExists.sync(path.join(__dirname, 'tmp/1')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/2')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/3')));
	});

	it('forwards CLI args to grunt sub-processes', function (done) {
		var expected = '--arg1=test,--arg2';

		exec('grunt concurrent:testargs ' + expected, function () {
			assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/args1'), 'utf8'), expected);
			assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/args2'), 'utf8'), expected);
			done();
		});
	});

	describe('`logConcurrentOutput` option', function () {
		var logOutput = '';

		before(function (done) {
			var cp = spawn('grunt', ['concurrent:log']);

			cp.stdout.setEncoding('utf8');
			cp.stdout.on('data', function (data) {
				logOutput += data;
				cp.kill();
				done();
			});
		});

		it('outputs concurrent logging', function () {
			var expected = 'Running "concurrent:log" (concurrent) task';
			assert(logOutput.indexOf(expected) !== -1);
		});
	});
});
