'use strict';
/* eslint-env mocha */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var pathExists = require('path-exists');
var spawn = require('cross-spawn');

describe('concurrent', function () {
	it('runs grunt tasks successfully', function () {
		assert(pathExists.sync(path.join(__dirname, 'tmp/1')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/2')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/3')));
	});

	it('runs grunt task sequence successfully', function () {
		var file5 = fs.statSync(path.join(__dirname, 'tmp/5'));
		var file6 = fs.statSync(path.join(__dirname, 'tmp/6'));
		assert.ok(Date.parse(file5.ctime) < Date.parse(file6.ctime));
	});

	it('forwards CLI args to grunt sub-processes', function (done) {
		var expected = '--arg1=test,--arg2';

		exec('grunt concurrent:testargs ' + expected, function () {
			var args1 = fs.readFileSync(path.join(__dirname, 'tmp/args1'), 'utf8');
			var args2 = fs.readFileSync(path.join(__dirname, 'tmp/args2'), 'utf8');
			assert.ok(args1.indexOf(expected) !== -1);
			assert.ok(args2.indexOf(expected) !== -1);
			done();
		});
	});

	describe('`logConcurrentOutput` option', function () {
		var logOutput = '';

		before(function (done) {
			var doneCalled = false;
			var cp = spawn('grunt', ['concurrent:log']);

			cp.stdout.setEncoding('utf8');
			cp.stdout.on('data', function (data) {
				logOutput += data;
				cp.kill();
				if (!doneCalled) {
					doneCalled = true;
					done();
				}
			});
		});

		it('outputs concurrent logging', function () {
			var expected = 'Running "concurrent:log" (concurrent) task';
			assert(logOutput.indexOf(expected) !== -1);
		});
	});

	describe('works with supports-color lib', function () {
		it('ensures that colors are supported by default', function (done) {
			exec('grunt concurrent:colors', function () {
				assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/colors'), 'utf8'), 'true');
				done();
			});
		});

		it('doesn\'t support colors with --no-color option', function (done) {
			exec('grunt concurrent:colors --no-color', function () {
				assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/colors'), 'utf8'), 'false');
				done();
			});
		});
	});

	describe('`env` option', function () {
		it('outputs the added environment options', function (done) {
			exec('grunt concurrent:testenv', function () {
				var env1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'tmp/env1'), 'utf8'));
				var env2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'tmp/env2'), 'utf8'));

				assert.equal(env1.testenv, 'testenv1');
				assert.equal(env2.testenv, undefined);

				done();
			});
		});
	});
});
