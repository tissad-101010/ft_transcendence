import fastify from 'fastify';

import Database from 'better-sqlite3';

const db = new Database('mydb.db', {
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log
});

try
{
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
} catch (err: unknown)
{
  if (err instanceof Error)
    console.error("Erreur lors de la creation de la table : ", err.message);
  else
    console.log("L'erreur ne provient pas de sqlite");
}

try
{
  const rows = db.prepare('SELECT * FROM users').all();
  console.log(rows);
} catch (err: unknown)
{
  if (err instanceof Error)
    console.error("Error lors du select * from users", err.message);
  else
    console.log("L'erreur ne provient pas de sqlite");
}


try
{
  const insert = db.prepare('INSERT INTO users (login, password, email) VALUES (?, ?, ?)');
  insert.run('nostag', '1234', 'nostag@example.com');
  insert.run('lolo', '1235', 'lolo@example.com');
} catch (err: unknown)
{
  if (err instanceof Error)
    console.error("Error lors de l'insert ", err.message);
  else
    console.log("L'erreur ne provient pas de sqlite");
}

const server = fastify({logger: true});

server.post<{
  Body: {
    login: string,
    email: string,
    password: string
  };
}>('/login', async (request, reply) => {
  const {login, email, password} = request.body;
  try
  {
    const res = db.prepare('SELECT * FROM users WHERE login=@login AND password=@password AND email=@email ').all({
      login: login,
      email: email,
      password: password
    })
    if (res.length != 1)
      reply.code(200).send({success:false});
    else
      reply.code(200).send({success:true});
  } catch (err: unknown)
  {
    if (err instanceof Error)
      console.error("Error route /login : ", err.message);
    else
      console.error("Error route /login mais pas de sqlite");
   reply.code(400).send({success:false});
  }
})

interface IQueryString
{
  'name': string;
  'pwd': string;
};

interface IHeaders
{
  'h-Custom': string;
}

interface IReply
{
  200: { success: boolean };
  302: { url: string };
  '4xx': { error: string };
}


server.post<{
  Querystring: IQueryString,
  Headers: IHeaders,
  Reply: IReply
}>('/register', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'pwd'],
      properties: {
        name: { type: 'string' },
        pwd: { type: 'string' }
      }
    },
    response: {
      '2xx': {
        type: 'object',
        properties: { success: { type: 'boolean' } }
      },
      '4xx': {
        type: 'object',
        properties: { error: { type: 'string' } }
      },
      302: {
        type: 'object',
        properties: { error: { type: 'string' } }
      }
    }
  }
}, async (request, reply) => {
  const {name, pwd} = request.query;
  const customHeader = request.headers['h-Custom'];
  console.log(name, pwd, customHeader);
  reply.code(200).send({success: true});
  // reply.code(200).send("ZzZ");
  // reply.code(404).send({error: 'Not found'});
  // return `logged in!`;
});

const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' });
    console.log(`Server listening at localhost:4000`);
  } catch (err)
  {
    server.log.error(err);
    process.exit(1);
  }
};


start();
