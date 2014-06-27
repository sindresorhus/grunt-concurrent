/*global describe, it, before */
'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var expandTargets = require('../lib/expandTargets.js');


describe('concurrent', function () {
	it('runs grunt tasks successfully', function () {
		assert(fs.existsSync(path.join(__dirname, 'tmp/1')));
		assert(fs.existsSync(path.join(__dirname, 'tmp/2')));
		assert(fs.existsSync(path.join(__dirname, 'tmp/3')));
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
			var lines = 0;

			cp.stdout.setEncoding('utf8');
			cp.stdout.on('data', function (data) {
				logOutput += data;

				if (data.indexOf('\n') !== -1) {
					lines++;
				} else {
					cp.kill();
					done();
				}
			});
		});

		it('outputs concurrent logging', function () {
			var expected = 'Running "concurrent:log" (concurrent) task';
			assert(logOutput.indexOf(expected) !== -1);
		});
	});

	describe('`expandTargets` option', function () {
		var fakeGrunt = {
			config: {
				getRaw: function() {
					return {
						taskA: {
							targetA1: {},
							targetA2: {},
							options: {}
						},
						taskB: {
							targetB1: {},
							targetB2: {},
							files: {}
						},
						taskC: {
							targetC1: {},
							targetC2: {},
							files: {}
						}
					};
				}
			}
		};

		var tasks = ['taskA', 'taskB', 'taskC:targetC1']

		var ignoreTargets = ['options', 'files']; 

		var expected = [
			'taskA:targetA1',
			'taskB:targetB1',
			'taskC:targetC1',
			'taskA:targetA2',
			'taskB:targetB2'
		];

		var explodedTargets = expandTargets(tasks, ignoreTargets, fakeGrunt);

		it('expands tasks for each target and zippers results', function () {
			assert.deepEqual(expected, explodedTargets);
		});
		it('ignores special targets', function () {
			return ignoreTargets.forEach(function matchTarget (specialTarget) {
				return explodedTargets.forEach(function matchSpecial (taskTarget) {
					return assert(!taskTarget.match(specialTarget));
				});
			});
		})
	});
});
