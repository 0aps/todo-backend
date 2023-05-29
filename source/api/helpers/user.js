'use strict';

const md5 = require('md5')
const anxeb = require('anxeb-node')

module.exports = function (context, user) {
	const _context = context;
	const _user = user;

	return {
		getAuthResponse : async function( params = {}) {
			const self = this;

			_user.login.date = anxeb.utils.date.utc().unix()
			let $user=_user.toClient();

			_context.data.retrieve.User(_user._id || _user.id).then(function (user) {
				user.login.date = anxeb.utils.date.utc().unix();
				if(params.changes){
					params.changes(user);
				}
				user.persist();
			}).catch(function (err) { });

			// if(_user.isClient() && _user.hasContactId()) {
			// 	const units = await self.getUnits()
			// 	$user.info = {
			// 		...($user.info||{}),
			// 			units : units.toClient()
			// 	}
			// }
			let $type = $user.role === 'admin' ? 'system' : 'app';
			let $roles = [`${$type}_${$user.role}`]

			return {
				user: $user,
				roles: $roles,
				povider : $user.login.provider,
				token: context.sign({
					user: {
						id : $user.id,
						first_names: $user.first_names,
						last_names: $user.last_names,
						email : $user.login.email.trim().toLowerCase(),
						info : $user.info,
						meta : $user.meta,
						role : $user.role,
					},
					identity : $user.id,
					claims: [],
					roles: $roles,
					type : $type,
				}),
				// flags : {
				// 	change_pass: user.meta != null && user.login.password === user.meta.generated_password
				// },
			}
		}
	}
};