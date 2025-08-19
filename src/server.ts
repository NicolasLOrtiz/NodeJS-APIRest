import fastify from 'fastify'
import {dbConfig} from './database'
import {env} from "./env";

const app = fastify()

app.get('/hello', async () => {
    return await dbConfig('transactions')
        .where('amount', 1000)
        .select('*')
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP Server Running!')
})
