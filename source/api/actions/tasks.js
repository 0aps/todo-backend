'use strict';

const anxeb = require('anxeb-node');

module.exports = {
	url: '/tasks',
	type: anxeb.Route.types.action,
	access: anxeb.Route.access.public,
	owners: '*',
	roles:  '*',
	timeout: 60000,
	methods: {
		/**
		 * @openapi
		 * /users:
		 *   get:
		 *     description: Return a list of all the users
		 *     tags: [Users]
		 *     responses:
		 *       200:
		 *         description: List of users
		 *         content:
		 *           application/json:
		 *            schema:
		 *              $ref: '#/components/schemas/UserList'
		 */
		get: async function (context) {
			const query = context.query || {};
			// if (!context.isAdmin){
			// 		query['user'] = context.profile.identity;
			// }
			const tasks = await context.data.list.Task(query);
			context.send(tasks.toClient());
		},
		/**
		 * @swagger
		 * /users:
		 *   post:
		 *     description: Create a new user
		 *     tags: [Users]
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             $ref: '#/components/schemas/UserPayload'
		 *     responses:
		 *       200:
		 *         description: The user was created
		 *         content:
		 *           application/json:
		 *            schema:
		 *              $ref: '#/components/schemas/User'
		 */
		post: async function (context) {
			const payload = context.payload.task;
			console.log(payload)

			const task = context.data.create.Task({
				title: payload.title,
				taskDescription: payload.taskDescription,
				priority: payload.priority ? payload.priority : 'green',
				checks: payload.checks? payload.checks : false,
				date: anxeb.utils.date.utc().unix(),
				user: context.profile.identity // accedo al id del usuario y lo guardo
			});

			await task.persist();

			context.send(task.toClient());
		}
	},
	childs: {
		item: {
			url: '/:taskId',
			methods: {
				/**
				 * @openapi
				 * /users/{userId}:
				 *   get:
				 *     description: Get a specific user by id
				 *     tags: [Users]
				 *     parameters:
				 *        - name: userId
				 *          type: string
				 *          in: path
				 *          required: true
				 *          description: The user id
				 *     responses:
				 *       200:
				 *         description: The user was retrieved
				 *         content:
				 *           application/json:
				 *            schema:
				 *              $ref: '#/components/schemas/User'
				 *       404:
				 *         description: The user was not found
				 */
				get: async function (context) {
					const task = await context.data.retrieve.Task(context.params.taskId);
					if (context.isAdmin) {
						if (!task) {
							context.log.exception.record_not_found.args('Tarea', context.params.taskId).throw();
						}	
						context.send(task.toClient());
					}
					const query = context.query || {};
					if (!context.isAdmin){
						query['user'] = context.profile.identity;


						task.user == context.profile.identity? await context.send(task.toClient()):
						context.log.exception.record_not_found.args('Tarea', context.params.taskId).throw();
							
				}		
				},
				
				/**
				 * @openapi
				 * /users/{userId}:
				 *   put:
				 *     description: Update a specific user
				 *     tags: [Users]
				 *     parameters:
				 *       - name: userId
				 *         type: string
				 *         in: path
				 *         required: true
				 *         description: The user id
				 *     requestBody:
				 *       required: true
				 *       content:
				 *         application/json:
				 *           schema:
				 *             $ref: '#/components/schemas/UserPayload'
				 *     responses:
				 *       200:
				 *         description: The user was updated
				 *         content:
				 *           application/json:
				 *             schema:
				 *               $ref: '#/components/schemas/User'
				 *       404:
				 *         description: The user was not found
				 *       500:
				 *         description: An error happened
				 */
				put: async function (context) {
					const task = await context.data.retrieve.Task(context.params.taskId);
					const payload = context.payload;
					if (context.isAdmin) {
						const payload = context.payload;
						if (!task) {
							context.log.exception.record_not_found.args('Tarea', context.params.taskrId).throw();
						}
						task.title = payload.title;
					}
					const query = context.query || {};
					if (!context.isAdmin){
						query['user'] = context.profile.identity;
						if (task.user == context.profile.identity) {
							task.title = payload.title;
							await context.send(task.toClient());
						}else{
							context.log.exception.record_not_found.args('Tarea', context.params.taskId).throw();
						}
					}
					await task.persist();

					context.send(task.toClient());
				},
				/**
				 * @openapi
				 * /users/{userId}:
				 *   delete:
				 *     description: Remove a specific user
				 *     tags: [Users]
				 *     parameters:
				 *       - name: userId
				 *         type: string
				 *         in: path
				 *         required: true
				 *         description: The user id
				 *     responses:
				 *       200:
				 *         description: The user was deleted
				 *       404:
				 *         description: The user was not found
				 */
				delete: async function (context) {
					const task = await context.data.retrieve.Task(context.params.taskId);
					if (context.isAdmin) {
					if (!task) {
						context.log.exception.record_not_found.args('Tarea', context.params.taskId).throw();
					}
				}
				const query = context.query || {};
					if (!context.isAdmin){
						query['user'] = context.profile.identity;
						if (task.user == context.profile.identity) {
							await task.delete();
						}else{
							context.log.exception.record_not_found.args('Tarea', context.params.taskId).throw();
						}
					}
					await task.delete();

					context.send(task.toClient());
				}
			}
		}
	}
};