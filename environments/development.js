module.exports = {
	type : 'development',
	api  : {
		socket   : {
			host : `localhost`,
			port : 6401,
			cors : {
				origin         : '*',
				exposedHeaders : []
			}
		},
		security : {
			session : {
				name   : 'info.todo',
				secret : process.env.JWT_SECRET || 'fdsg88w99m5h8wyer0h,',
				resave : false,
			},
		},
		mongodb  : {
			key          : 'todo-dev-db',
			uri          : process.env.DB_URI || 'mongodb://localhost:27017/todo-dev?w=majority&readPreference=primary&retryWrites=true&directConnection=true&ssl=false',
			options      : {
				autoReconnect      : false,
				useUnifiedTopology : true,
				keepAlive          : 2000,
				poolSize           : 4,
				useFindAndModify   : false
			},
			retryTimeout : 2592000
		},
		smtp     : {
			account : 'To-do <info@todo.com>',
			host    : 'smtp.ethereal.email',
			port    : 587,
			secure  : false,
			auth    : {
				user : 'jerrod68@ethereal.email',
				pass : 'k6UFSYPTDy71HdRA5Z'
			}
		}
	},
}