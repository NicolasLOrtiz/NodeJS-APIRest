import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { dbConfig } from '../database'

export async function tasksRoutes(app: FastifyInstance) {
  // POST /tasks
  app.post('/', async (request, reply) => {
    const createTaskBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const _body = createTaskBodySchema.safeParse(request.body)
    if (!_body.success) {
      return reply.status(400).send({ error: 'title and description are required' })
    }

    const { title, description } = _body.data

    const id = randomUUID()

    await dbConfig('tasks').insert({
      id,
      title,
      description,
      completed_at: null,
      // created_at and updated_at have defaults in DB, but we can set them explicit or leave to knex
    })

    return reply.status(201).send()
  })

  // GET /tasks
  app.get('/', async (request, reply) => {
    const getTasksQuerySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })

    const { title, description } = getTasksQuerySchema.parse(request.query)

    let query = dbConfig('tasks').select('*')

    if (title) {
      query = query.where('title', 'like', `%${title}%`)
    }

    if (description) {
      query = query.where('description', 'like', `%${description}%`)
    }

    const tasks = await query

    return { tasks }
  })

  // PUT /tasks/:id
  app.put('/:id', async (request, reply) => {
    const updateTaskParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateTaskBodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })

    const _params = updateTaskParamsSchema.safeParse(request.params)
    if (!_params.success) {
      return reply.status(400).send({ error: 'Invalid ID format' })
    }

    const { id } = _params.data

    const _body = updateTaskBodySchema.safeParse(request.body)
    if (!_body.success || (!request.body || Object.keys(request.body as object).length === 0)) {
        return reply.status(400).send({ error: 'title or description is required for update' })
    }
    const { title, description } = _body.data

    const task = await dbConfig('tasks').where({ id }).first()

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' })
    }

    const updateData: any = { updated_at: dbConfig.fn.now() }
    if (title) updateData.title = title
    if (description) updateData.description = description

    await dbConfig('tasks').where({ id }).update(updateData)

    return reply.status(204).send()
  })

  // DELETE /tasks/:id
  app.delete('/:id', async (request, reply) => {
    const deleteTaskParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const _params = deleteTaskParamsSchema.safeParse(request.params)
    if (!_params.success) {
      return reply.status(400).send({ error: 'Invalid ID format' })
    }

    const { id } = _params.data

    const task = await dbConfig('tasks').where({ id }).first()

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' })
    }

    await dbConfig('tasks').where({ id }).delete()

    return reply.status(204).send()
  })

  // PATCH /tasks/:id/complete
  app.patch('/:id/complete', async (request, reply) => {
    const patchTaskParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const _params = patchTaskParamsSchema.safeParse(request.params)
    if (!_params.success) {
      return reply.status(400).send({ error: 'Invalid ID format' })
    }

    const { id } = _params.data

    const task = await dbConfig('tasks').where({ id }).first()

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' })
    }

    const isCompleted = !!task.completed_at
    const completed_at = isCompleted ? null : dbConfig.fn.now()

    await dbConfig('tasks').where({ id }).update({
      completed_at,
      updated_at: dbConfig.fn.now()
    })

    return reply.status(204).send()
  })
}
