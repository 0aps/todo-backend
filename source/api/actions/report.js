'use strict';
const anxeb = require('anxeb-node');
const Reporting = require('../../middleware/reporting');

module.exports = {
	type    : anxeb.Route.types.action,
	access  : anxeb.Route.access.public,
	owners  : ['*'],
	roles   : ['*'],
	timeout : 60000,
	methods : {
		post : async function (context) {
			let params = context.payload;
			let reporting = new Reporting(context, {
				templates : 'api/templates',
				storage   : 'reports',
				scripts   : []
			});

			context.send(await reporting.build(params));
		},
		get  : async function (context) {
			let params = context.query;
			let reporting = new Reporting(context, {
				templates : 'api/templates',
				storage   : 'reports',
				scripts   : []
			});

			reporting.send(params);
		}
	}
};