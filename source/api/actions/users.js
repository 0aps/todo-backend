'use strict';

const anxeb = require('anxeb-node');
const md5 = require('md5');


module.exports = {
	url     : '/users',
	type    : anxeb.Route.types.action,
	access  : anxeb.Route.access.private,
	owners  :'*',
	timeout : 60000,
	methods : {

		get : async function (context) {
			const users = await context.data.list.User({});

			context.send(users.toClient());
		},

		 post : async function (context) {
		 	const payload = context.payload.user; //front
			//const payload = context.payload
			if (payload.login.email != null) {
				let rep_email = await context.data.find.User({ 'login.email' : payload.login.email.trim().toLowerCase(), 'meta.deleted' : { $exists : false } });

				if (rep_email && !rep_email._id.equals(payload.id)) {
					context.log.exception.selected_name_unavailable.args('Correo').include({
						fields : [{ name : 'login.email', index : 1 }]
					}).throw();
				}
			}
			let user = await context.data.upsert.User(payload.id);

			payload.login.email = payload.login.email ? payload.login.email.trim().toLowerCase() : user.login.email;
			payload.login.password = payload.login.password ? payload.login.password.trim().toLowerCase() : user.login.password;
			if (payload.login.password && (md5(payload.login.password.trim().length) < 4 || md5(payload.login.password.trim().length) > 18)) {
				context.log.exception.invalid_password.include({
					fields : [{ name : 'login.password', index : 1 }]
				}).throw();
			}

			 let password = payload.login.password ? md5(payload.login.password.trim().toLowerCase()) : null;
			 payload.login.password = password || payload.login.password;
			 payload.login.provider = password != null || !payload.id ? 'email' : user.login.provider;
 
			 anxeb.utils.data.populate(user, payload);

			 user.role = (payload.role ? payload.role : user.role) || 'admin';
		 	await user.persist();

		 	context.send(user.toClient());
		 }
	},
	childs  : {
		item : {
			url     : '/:userId',
			methods : {
		
				get : async function (context) {
					const user = await context.data.retrieve.User(context.params.userId);

					if (!user) {
						context.log.exception.record_not_found.args('Usuario', context.params.userId).throw();
					}

					context.send(user.toClient());
				},

				delete : async function (context) {
					const user = await context.data.retrieve.User(context.params.userId);

					if (!user) {
						context.log.exception.record_not_found.args('Usuario', context.params.userId).throw();
					}

					await user.delete();

					context.send(user.toClient());
				}
			}
		}
	}
};