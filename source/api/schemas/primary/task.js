'use strict';

const fields = require('anxeb-mongoose').Fields;
const SchemaBuilder = require('../../../middleware/schema');

module.exports = {
	Schema : function (params) {
		return new SchemaBuilder(params, 'Task').build((builder) => ({
			name        : fields.string({ required : true }),
			description : fields.string({ required : true }),
			date        : fields.number({ required : true }),
			done        : fields.bool({ required : true }),
			order       : fields.number({ required : true }),
			user        : fields.reference({ required : true, index : true }, 'User'),
		}));
	}
};