'use strict';
/* eslint-env mocha */
const {strict: assert} = require('assert');
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const pathExists = require('path-exists');
const spawn = require('cross-spawn');

describe('concurrent', () => {
	it('runs grunt tasks successfully', () => {
		assert(pathExists.sync(path.join(__dirname, 'tmp/1')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/2')));
		assert(pathExists.sync(path.join(__dirname, 'tmp/3')));
	});

	it('runs grunt task sequence successfully', () => {
		const file5 = fs.statSync(path.join(__dirname, 'tmp/5'));
		const file6 = fs.statSync(path.join(__dirname, 'tmp/6'));
		assert.ok(Date.parse(file5.ctime) < Date.parse(file6.ctime));
	});

	it('forwards CLI args to grunt sub-processes', done => {
		const expected = '--arg1=test,--arg2';

		exec('grunt concurrent:testargs ' + expected, () => {
			const args1 = fs.readFileSync(path.join(__dirname, 'tmp/args1'), 'utf8');
			const args2 = fs.readFileSync(path.join(__dirname, 'tmp/args2'), 'utf8');
			assert.ok(args1.includes(expected));
			assert.ok(args2.includes(expected));
			done();
		});
	});

	describe('`logConcurrentOutput` option', () => {
		let logOutput = '';

		before(done => {
			let isDoneCalled = false;
			const subprocess = spawn('grunt', ['concurrent:log']);

			subprocess.stdout.setEncoding('utf8');
			subprocess.stdout.on('data', data => {
				logOutput += data;
				subprocess.kill();
				if (!isDoneCalled) {
					isDoneCalled = true;
					done();
				}
			});
		});

		it('outputs concurrent logging', () => {
			const expected = 'Running "concurrent:log" (concurrent) task';
			assert(logOutput.includes(expected));
		});
	});

	describe('works with supports-color lib', () => {
		it('ensures that colors are supported by default', done => {
			exec('grunt concurrent:colors', () => {
				assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/colors'), 'utf8'), 'true');
				done();
			});
		});

		it('doesn\'t support colors with --no-color option', done => {
			exec('grunt concurrent:colors --no-color', () => {
				assert.equal(fs.readFileSync(path.join(__dirname, 'tmp/colors'), 'utf8'), 'false');
				done();
			});
		});
	});

	describe('`indent` option', () => {
		const testOutput = 'indent test output';
		const indentedTestOutput = '    ' + testOutput;

		it('indents output when true', done => {
			exec('grunt concurrent:indentTrue', (error, stdout) => {
				assert.ok(stdout.split('\n').includes(indentedTestOutput));
				done();
			});
		});

		it('does not indent output when false', done => {
			exec('grunt concurrent:indentFalse', (error, stdout) => {
				assert.ok(stdout.split('\n').includes(testOutput));
				done();
			});
		});

		it('does not indent output when false and logConcurrentOutput is true', done => {
			exec('grunt concurrent:indentFalseConcurrentOutput', (error, stdout) => {
				assert.ok(stdout.split('\n').includes(testOutput));
				done();
			});
		});

		it('indents output by default', done => {
			exec('grunt concurrent:indentDefault', (error, stdout) => {
				assert.ok(stdout.split('\n').includes(indentedTestOutput));
				done();
			});
		});
	});
});
