# grunt-concurrent [![Build Status](https://secure.travis-ci.org/sindresorhus/grunt-concurrent.png?branch=master)](http://travis-ci.org/sindresorhus/grunt-concurrent)

> Run grunt tasks concurrently

Running slow tasks like Coffee and Sass concurrently can potensially improve your build time significantly.

![screenshot](screenshot.png)

*Requires grunt 0.4*


## Getting Started

If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```sh
npm install grunt-concurrent --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-concurrent');
```

[grunt]: http://gruntjs.com
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started


## Documentation

See the [Gruntfile](Gruntfile.js) in this repo for a full example.

Just specify the tasks you want to run concurrently as an array in a target of this task as shown below.


### Example config

This will first run the Coffee and Sass tasks at the same time, then the JSHint and Mocha tasks at the same time.

```javascript
grunt.initConfig({
	concurrent: {
		target1: ['coffee', 'sass'],
		target2: ['jshint', 'mocha']
	}
});

grunt.loadNpmTasks('grunt-concurrent');
grunt.registerTask('default', ['concurrent:target1', 'concurrent:target2']);
```


## Contribute

In lieu of a formal styleguide, take care to maintain the existing coding style.


## License

MIT License
(c) [Sindre Sorhus](http://sindresorhus.com)
