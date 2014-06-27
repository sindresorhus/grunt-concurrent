# grunt-concurrent [![Build Status](https://travis-ci.org/sindresorhus/grunt-concurrent.svg?branch=master)](https://travis-ci.org/sindresorhus/grunt-concurrent)

> Run grunt tasks concurrently

Running slow tasks like Coffee and Sass concurrently can potentially improve your build time significantly. This task is also useful if you need to run multiple blocking tasks like `nodemon` and `watch` at once, as seen in the example config.

![screenshot](screenshot.png)

This task is similar to grunt-parallel, but more focused by leaving out support for shell scripts which results in a leaner config. It also has a smaller dependency size and pads the output of concurrent tasks, as seen above.


## Getting Started

If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```bash
$ npm install grunt-concurrent --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-concurrent');
```

*Tip: the [load-grunt-tasks](https://github.com/sindresorhus/load-grunt-tasks) module makes it easier to load multiple grunt tasks.*


[grunt]: http://gruntjs.com
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started


## Documentation

See the [Gruntfile](Gruntfile.js) in this repo for a full example.

Just specify the tasks you want to run concurrently as an array in a target of this task as shown below.


### Example config

This will first run the Coffee and Sass tasks at the same time, then the JSHint and Mocha tasks at the same time.

```js
grunt.initConfig({
	concurrent: {
		target1: ['coffee', 'sass'],
		target2: ['jshint', 'mocha']
	}
});

grunt.loadNpmTasks('grunt-concurrent');
grunt.registerTask('default', ['concurrent:target1', 'concurrent:target2']);
```


## Options

### limit

Type: `Number`  
Default: Number of CPU cores (`require('os').cpus().length`) with a minimum of 2

Limit of how many tasks that are run concurrently.

### logConcurrentOutput

Type: `Boolean`  
Default: `false`

You can optionally log the output of your concurrent tasks by specifying the `logConcurrentOutput` option. Here is an example config which runs [grunt-nodemon](https://github.com/ChrisWren/grunt-nodemon) to launch and monitor a node server and [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch) to watch for asset changes all in one terminal tab:

```js
grunt.initConfig({
	concurrent: {
		target: {
			tasks: ['nodemon', 'watch'],
			options: {
				logConcurrentOutput: true
			}
		}
	}
});

grunt.loadNpmTasks('grunt-concurrent');
grunt.registerTask('default', ['concurrent:target']);
```

*Note the output will be messy when combining certain tasks. This option is best used with tasks that don't exit like watch and nodemon to monitor the output of long-running concurrent tasks.*

## concurrentTargets 

Type: `Boolean`
Default: `false`

Run individual targets of each task concurrently. This only applies to tasks specified without specific targets. Targets named `files` and `options` will be ignored, and additional tasks can be configured to be ignored as well (see `ignoreTargets` option).

### Example

Gruntfile:
```js
grunt.initConfig({
    taskA: {
        targetA1: {...},
        targetA2: {...},
        options: {...}
    },
    taskB: {
        targetB1: {...},
        targetB2: {...},
        src: [...]
    },
    taskC: {
        targetC1: {...},
        targetC2: {...},
        files: [...]
    },
    concurrent: {
        target: {
            tasks: ['taskA', 'taskB', 'taskC:targetC1'],
            options: {
                concurrentTargets: true,
                ignoreTargets: ['src']
            }
        }
    }
};

grunt.loadNpmTasks('grunt-concurrent');
grunt.registerTask('default', ['concurrent:target']);
```

Given the above Gruntfile, processes will be spawned to run tasks in the following order (actual order of task completion is not guaranteed):
```js
'taskA:targetA1',
'taskB:targetB1',
'taskC:targetC1',
'taskA:targetA2',
'taskB:targetB2'
```

##ignoreTargets

Type: `Array`
Default: `[]`

Task properties that should be ignored when expanding task-targets into tasks to be run concurrently. 

## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
