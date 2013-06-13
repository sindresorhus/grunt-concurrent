/*global describe, it, before */
'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var concurrentLogOuput = '';

describe('concurrent', function () {
	it('runs grunt tasks successfully', function () {
		assert(fs.existsSync(path.join(__dirname, 'tmp/1')));
		assert(fs.existsSync(path.join(__dirname, 'tmp/2')));
		assert(fs.existsSync(path.join(__dirname, 'tmp/3')));
	});
});

describe('When the \'logConcurrentOutput\' option is enabled, grunt-concurrent', function () {
	before( function (done) {
		var concurrentLogProcess = spawn('grunt', ['concurrent:log']);
		var linesOfOutput = 0;
		var doneLogging = false;

		concurrentLogProcess.stdout.setEncoding('utf8');
		concurrentLogProcess.stdout.on('data', function (data) {
			concurrentLogOuput += data;
			if ((data.indexOf('\n') !== -1)) {
				linesOfOutput++;
			}
			if (linesOfOutput === 3 && !doneLogging) {
				doneLogging = true;
				concurrentLogProcess.kill();
				done();
			}
		});
	});

	it('outputs concurrent logging', function () {
		assert(concurrentLogOuput.indexOf(fs.readFileSync('test/fixtures/expectedLogOutput.txt', 'utf8') === 0));
	});
});

describe('Command line args', function () {
	before( function (done) {
		execFile('grunt concurrent:testargs --arg1=test --arg2', done);
	});

	it('are forwarded to grunt tasks', function () {
		var expected = fs.readFileSync('test/fixtures/expectedArgsOutput.txt', 'utf8');

		assert(expected.indexOf(fs.readFileSync(path.join(__dirname, 'tmp/args1'), 'utf8')) === 0);
		assert(expected.indexOf(fs.readFileSync(path.join(__dirname, 'tmp/args2'), 'utf8')) === 0);
	});
});