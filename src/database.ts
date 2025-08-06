import knex from 'knex'

export const dbconfig = knex({
    client: 'sqlite3',
    connection: {
        filename: './tmp/app.db',
    },
});
