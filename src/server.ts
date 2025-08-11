import fastify from 'fastify'
import {dbConfig} from './database'

const app = fastify()

app.get('/hello', async () => {
    return dbConfig('sqlite_schema').select('*');
})

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server Running!')
})
