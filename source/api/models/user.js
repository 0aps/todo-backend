'use strict';

const User = require('../schemas/primary/user');
const Helper = require("../helpers/user");

module.exports = {
	collection : 'Users',
	schema     : new User.Schema(),
	methods    : {
		toClient : function () {
			return {
				id          : this._id,
				first_names : this.first_names,
				// last_names : this.last_names,
				// role : this.role,
				// login : this.login,
				// info : this.info,
				// meta : this.meta
			}
		},
		using    : function (context) {
			return new Helper(context, this)
		},
	}
};