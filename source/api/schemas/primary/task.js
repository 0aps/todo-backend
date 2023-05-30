'use strict';

const fields = require('anxeb-mongoose').Fields;
const SchemaBuilder = require('../../../middleware/schema');

module.exports = {
	Schema : function (params) {
		return new SchemaBuilder(params, 'Task').build((builder) => ({
			title : fields.string({ required : true }),
			description : fields.string({required: true}),
			priority : fields.enum([ 'red', 'orange', 'yellow','green']),
			check : fields.bool({required : true},{default: false}),
            date : fields.date({required: true}),
            // creator : fields.string({ required : true }),
		}));
	}
};