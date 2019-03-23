/**
 * Module dependencies.
 */
const request = require('supertest');
const path = require('path');

const express = require(path.resolve('./lib/services/express'));
const mongooseService = require(path.resolve('./lib/services/mongoose'));

/**
 * Unit tests
 */
describe('User CRUD Unit Tests :', () => {
  let UserService = null;

  // Mongoose init
  beforeAll(() => mongooseService.connect()
    .then(() => {
      mongooseService.loadModels();
      UserService = require(path.resolve('./modules/users/services/user.service'));
    })
    .catch((e) => {
      console.log(e);
    }));


  // Globals
  let app;

  let agent;
  let credentials;
  let user;
  let _user;
  let _tasks;
  let task1;
  let task2;

  /**
 * User routes tests
 */
  describe('Task CRUD User logged', () => {
    beforeAll((done) => {
    // Get application
      app = express.init();
      agent = request.agent(app);

      done();
    });

    beforeEach(async () => {
    // user credentials
      credentials = {
        email: 'task@test.com',
        password: 'W@os.jsI$Aw3$0m3',
      };

      // user
      _user = {
        firstName: 'Full',
        lastName: 'Name',
        displayName: 'Full Name',
        username: 'task',
        email: credentials.email,
        password: credentials.password,
        provider: 'local',
      };

      // add user
      try {
        const result = await agent.post('/api/auth/signup')
          .send(_user)
          .expect(200);
        user = result.body.user;
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }

      // tasks
      _tasks = [{
        title: 'title1',
        description: 'do something about something else',
      }, {
        title: 'title2',
        description: 'do something about something else',
      }];

      // add a task
      try {
        const result = await agent.post('/api/tasks')
          .send(_tasks[0])
          .expect(200);
        task1 = result.body.data;
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should be able to save a task', async () => {
      // add task
      try {
        const result = await agent.post('/api/tasks')
          .send(_tasks[1])
          .expect(200);
        task2 = result.body.data;
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task created');
        expect(result.body.data.title).toBe(_tasks[1].title);
        expect(result.body.data.description).toBe(_tasks[1].description);
        expect(result.body.data.user).toBe(user.id);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should not be able to save a task with bad model', async () => {
      // add task
      try {
        const result = await agent.post('/api/tasks')
          .send({
            title: 2,
            description: 'do something about something else',
          })
          .expect(422);
        expect(result.body.type).toBe('error');
        expect(result.body.message).toBe('schema validation error');
        expect(result.body.error.details[0].message).toBe('title must be a string');
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should be able to get a task', async () => {
      // delete task
      try {
        const result = await agent.get(`/api/tasks/${task2.id}`)
          .expect(200);
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task read');
        expect(result.body.data.id).toBe(task2.id);
        expect(result.body.data.title).toBe(_tasks[1].title);
        expect(result.body.data.description).toBe(_tasks[1].description);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should not be able to get a task with a bad mongoose id', async () => {
      // delete task
      try {
        const result = await agent.get('/api/tasks/test')
          .expect(404);
        expect(result.body.type).toBe('error');
        expect(result.body.message).toBe('No Task with that identifier has been found');
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should not be able to get a task with a bad invented id', async () => {
      // delete task
      try {
        const result = await agent.get('/api/tasks/waos56397898004243871228')
          .expect(404);
        expect(result.body.type).toBe('error');
        expect(result.body.message).toBe('No Task with that identifier has been found');
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should be able to edit a task if', async () => {
      // edit task
      try {
        const result = await agent.put(`/api/tasks/${task2.id}`)
          .send(_tasks[0])
          .expect(200);
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task updated');
        expect(result.body.data.id).toBe(task2.id);
        expect(result.body.data.title).toBe(_tasks[0].title);
        expect(result.body.data.description).toBe(_tasks[0].description);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should not be able to edit a task with a bad id', async () => {
      // edit task
      try {
        const result = await agent.put('/api/tasks/test')
          .send(_tasks[0])
          .expect(404);
        expect(result.body.type).toBe('error');
        expect(result.body.message).toBe('No Task with that identifier has been found');
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should be able to delete a task', async () => {
      // delete task
      try {
        const result = await agent.delete(`/api/tasks/${task2.id}`)
          .expect(200);
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task deleted');
        expect(result.body.data.id).toBe(task2.id);
        expect(result.body.data.deletedCount).toBe(1);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
      // check delete
      try {
        await agent.get(`/api/tasks/${task2.id}`)
          .expect(404);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    test('should not be able to delete a task with a bad id', async () => {
      // edit task
      try {
        const result = await agent.delete(`/api/tasks/${task2.id}`)
          .send(_tasks[0])
          .expect(404);
        expect(result.body.type).toBe('error');
        expect(result.body.message).toBe('No Task with that identifier has been found');
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });


    test('should be able to get list of tasks', async () => {
      // get list
      try {
        const result = await agent.get('/api/tasks')
          .expect(200);
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task list');
        expect(result.body.data).toBeInstanceOf(Array);
        expect(result.body.data).toHaveLength(1);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });

    afterEach(async () => {
      // del task
      try {
        await agent.delete(`/api/tasks/${task1.id}`)
          .expect(200);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
      // del user
      try {
        await UserService.delete(user);
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe('Task CRUD user logout', () => {
    beforeAll((done) => {
    // Get application
      app = express.init();
      agent = request.agent(app);

      done();
    });

    test('should not be able to save a task', async () => {
      try {
        const result = await agent.post('/api/tasks')
          .send(_tasks[0])
          .expect(401);
        expect(result.error.text).toBe('Unauthorized');
      } catch (err) {
        expect(err).toBeFalsy();
        console.log(err);
      }
    });

    test('should be able to get list of tasks', async () => {
      // get list
      try {
        const result = await agent.get('/api/tasks')
          .expect(200);
        expect(result.body.type).toBe('success');
        expect(result.body.message).toBe('task list');
        expect(result.body.data).toBeInstanceOf(Array);
        expect(result.body.data).toHaveLength(0);
      } catch (err) {
        console.log(err);
        expect(err).toBeFalsy();
      }
    });
  });

  // Mongoose disconnect
  afterAll(() => mongooseService.disconnect()
    .catch((e) => {
      console.log(e);
    }));
});