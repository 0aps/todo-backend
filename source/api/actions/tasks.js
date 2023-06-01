'use strict';

const anxeb = require('anxeb-node');

module.exports = {
	url     : '/tasks',
	access  : anxeb.Route.access.public,
	owners  : '*',
	roles   : {
		get   : '*',
		post  : '*',
		put   : '*',
		patch : '*',

	},
	timeout : 60000,
	methods : {
		get  : async function (context) {
			context.send({
				tasks: [],
				status: 'COMPLETED'
			});
		},
		post : async function (context) {
			const payload = context.payload;
			const task = context.data.create.Task({
				name : payload.name,
			});

			await task.persist();

			context.send(task.toClient());
		}
	}
};
