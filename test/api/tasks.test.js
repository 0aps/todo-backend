const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const server = require('../../entry').server;
const express = server.services.api.express;

describe('Task API endpoints', () => {
	const base = '/tasks';
	let agent;

	beforeAll(async () => {
		agent = request.agent(express);
	});

	test('should return the list of tasks', async () => {
		const response = await agent.get(base);
		expect(response.statusCode).toBe(StatusCodes.OK);
		expect(response.body).toBeInstanceOf(Array);
	});
});
