const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: El ID generado automáticamente de la tarea
 *         title:
 *           type: string
 *           description: El título de la tarea
 *         description:
 *           type: string
 *           description: La descripción de la tarea
 *         completed:
 *           type: boolean
 *           description: El estado de la tarea (completada o no)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: La fecha de creación de la tarea
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtiene la lista de todas las tareas, con opción de filtrar por estado.
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado (true o false). Opcional.
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *           description: Error interno del servidor
 */
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.completed !== undefined) {
            filter.completed = req.query.completed === 'true';
        }
        const tasks = await Task.find(filter);
        res.json(tasks);
    } catch (err) {
        console.error("Error en GET /tasks:", err);
        res.status(500).json({ message: 'Error al obtener las tareas' });
    }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *           description: Error interno del servidor
 */
router.post('/', [
    body('title').notEmpty().withMessage('El título es obligatorio').isLength({ max: 255 }).withMessage('El título no puede tener más de 255 caracteres'),
    body('description').isLength({ max: 1000 }).withMessage('La descripción no puede tener más de 1000 caracteres').optional({ nullable: true, checkFalsy: true }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const task = new Task({ title: req.body.title, description: req.body.description });
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        console.error("Error en POST /tasks:", err);
        res.status(500).json({ message: 'Error al crear la tarea' });
    }
});

async function getTask(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID de tarea no válido' });
        }
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        res.task = task;
        next();
    } catch (err) {
        console.error("Error en getTask middleware:", err);
        return res.status(500).json({ message: 'Error al buscar la tarea' });
    }
}

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea por su ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la tarea
 *     responses:
 *       200:
 *         description: La tarea encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *           description: Error interno del servidor
 *   patch:
 *     summary: Actualiza una tarea por su ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la tarea
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       400:
 *         description: ID inválido o Error en la solicitud
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *           description: Error interno del servidor
 *   delete:
 *     summary: Elimina una tarea por su ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *           description: Error interno del servidor
 */
router.get('/:id', getTask, (req, res) => res.json(res.task));

router.patch('/:id', getTask, [
    body('title').optional().isLength({ max: 255 }).withMessage('El título no puede tener más de 255 caracteres'),
    body('description').optional().isLength({ max: 1000 }).withMessage('La descripción no puede tener más de 1000 caracteres'),
    body('completed').optional().isBoolean().withMessage('El estado debe ser un booleano'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        if (req.body.title != null) res.task.title = req.body.title;
        if (req.body.description != null) res.task.description = req.body.description;
        if (req.body.completed != null) res.task.completed = req.body.completed;

        const updatedTask = await res.task.save();
        res.json(updatedTask);
    } catch (err) {
        console.error("Error en PATCH /tasks/:id:", err);
        res.status(500).json({ message: 'Error al actualizar la tarea' });
    }
});

router.delete('/:id', getTask, async (req, res) => {
    try {
        await Task.deleteOne({ _id: res.task._id });
        res.json({ message: 'Tarea eliminada' });
    } catch (err) {
        console.error("Error en DELETE /tasks/:id:", err);
        res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
});

module.exports = router;