var _ = require('underscore');
module.exports = function (tasks, ignoreTargets, grunt) {
	var taskTargets;
	// Expand each task with no target into an array of 'task:target' strings
	// Given a tn original tasks array that looks like: ['a', 'b:target1'],
	// taskTargets should look like [['a:target1', 'a:target2'], ['b:target1']];
	taskTargets = tasks.map(function getTaskTargets (task) {
		var tasksAndTargets = [];
		var config = grunt.config.getRaw()[task];
		var target;
		if (config) {
			for (target in config) {
				if (ignoreTargets.indexOf(target) < 0) {
					tasksAndTargets.push(task + ':' + target);
				}
			}
		} else {
			tasksAndTargets.push(task);
		}
		return tasksAndTargets
	});
	// Zipper the task-arrays together, so that each task is run concurrently:
	// This should result in the previous example array being transformed into
	// ['a:target1', 'b:target1', 'a:target2']
	return _.flatten(_.zip.apply(null, taskTargets)).filter(_.identity);
};
