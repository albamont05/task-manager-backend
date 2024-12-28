const request = require('supertest');
const { app, server } = require('../index');
const Task = require('../models/Task');
const mongoose = require('mongoose');

let serverTest;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    serverTest = app.listen(3001); // Puerto diferente para pruebas
});

afterEach(async () => {
    await Task.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    serverTest.close();
});

describe('Rutas de Tareas', () => {
    it('GET /api/tasks - debería obtener todas las tareas', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]); // Inicialmente vacío
    });

    it('GET /api/tasks?completed=true - debería obtener solo las tareas completadas', async () => {
        await Task.create({ title: 'Tarea completada 1', completed: true });
        await Task.create({ title: 'Tarea pendiente 1', completed: false });

        const res = await request(app).get('/api/tasks?completed=true');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].completed).toEqual(true);
    });

    it('GET /api/tasks?completed=false - debería obtener solo las tareas pendientes', async () => {
        await Task.create({ title: 'Tarea completada 1', completed: true });
        await Task.create({ title: 'Tarea pendiente 1', completed: false });

        const res = await request(app).get('/api/tasks?completed=false');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].completed).toEqual(false);
    });

    it('POST /api/tasks - debería crear una nueva tarea', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Nueva tarea', description: 'Descripción de la tarea' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Nueva tarea');
        expect(res.body.description).toEqual('Descripción de la tarea');

        const tasks = await Task.find({});
        expect(tasks.length).toEqual(1);
        expect(tasks[0].title).toEqual('Nueva tarea');
    });

    it('POST /api/tasks - debería retornar 400 por título vacío', async () => {
        const res = await request(app).post('/api/tasks').send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toEqual('El título es obligatorio');
    });

    it('POST /api/tasks - debería retornar 400 por título demasiado largo', async () => {
        const longTitle = 'a'.repeat(256); // Título de 256 caracteres
        const res = await request(app).post('/api/tasks').send({ title: longTitle });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('El título no puede tener más de 255 caracteres');
    });

    it('GET /api/tasks/:id - debería obtener una tarea por ID', async () => {
        const task = await Task.create({ title: 'Tarea por ID' });
        const res = await request(app).get(`/api/tasks/${task._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Tarea por ID');
    });

    it('PATCH /api/tasks/:id - debería actualizar una tarea', async () => {
        const task = await Task.create({ title: 'Tarea para actualizar', completed: false });
        const res = await request(app)
            .patch(`/api/tasks/${task._id}`)
            .send({ title: 'Tarea actualizada', completed: true });
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Tarea actualizada');
        expect(res.body.completed).toEqual(true);
    });

    it('DELETE /api/tasks/:id - debería eliminar una tarea', async () => {
        const task = await Task.create({ title: 'Tarea para eliminar' });
        const res = await request(app).delete(`/api/tasks/${task._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Tarea eliminada');

        const taskDeleted = await Task.findById(task._id);
        expect(taskDeleted).toBeNull();
    });

    // Pruebas de errores 400
    it('GET /api/tasks/:id - debería retornar 400 si el ID no es válido', async () => {
        const res = await request(app).get('/api/tasks/id_invalido');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('ID de tarea no válido');
    });

    it('PATCH /api/tasks/:id - debería retornar 400 si el ID no es válido', async () => {
        const res = await request(app).patch('/api/tasks/id_invalido').send({ title: 'Nuevo título' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('ID de tarea no válido');
    });

    it('DELETE /api/tasks/:id - debería retornar 400 si el ID no es válido', async () => {
        const res = await request(app).delete('/api/tasks/id_invalido');
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('ID de tarea no válido');
    });

    // Pruebas de errores 404
    it('GET /api/tasks/:id - debería retornar 404 si la tarea no existe', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/tasks/${nonExistentId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Tarea no encontrada');
    });

    it('PATCH /api/tasks/:id - debería retornar 404 si la tarea no existe', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).patch(`/api/tasks/${nonExistentId}`).send({ title: 'Nuevo título' });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Tarea no encontrada');
    });

    it('DELETE /api/tasks/:id - debería retornar 404 si la tarea no existe', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/tasks/${nonExistentId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Tarea no encontrada');
    });

    // Pruebas de errores 500
    it('GET /api/tasks - debería retornar 500 si hay un error en la base de datos', async () => {
        const mockFind = jest.spyOn(Task, 'find');
        mockFind.mockImplementation(() => { throw new Error('Simulated Database Error'); });
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Error al obtener las tareas');
        mockFind.mockRestore();
    });

    it('POST /api/tasks - debería retornar 500 si hay un error en la base de datos', async () => {
        const mockSave = jest.spyOn(Task.prototype, 'save');
        mockSave.mockImplementation(() => { throw new Error('Simulated Database Error'); });
        const res = await request(app).post('/api/tasks').send({ title: 'Tarea de prueba' });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Error al crear la tarea');
        mockSave.mockRestore();
    });
});