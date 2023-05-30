'use strict';

const Task = require('../schemas/primary/task');

module.exports = {
	collection: 'Tasks',
	schema: new Task.Schema(),
	methods: {
		toClient: function () {
			return {
				id: this._id,
				title: this.title,
				description: this.descrition,
				priority: this.priority,
				check: this.check,
				date: this.date
			}
		},
	}
};