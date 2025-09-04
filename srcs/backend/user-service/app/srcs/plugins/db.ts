/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 14:43:43 by tissad            #+#    #+#             */
/*   Updated: 2025/09/04 15:42:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file initializes the database connection and sets up the database

// fastify-plugin is used to create a plugin for fastify
// fp is a function that wraps the plugin
import fp from 'fastify-plugin'
import { Pool } from 'pg'
import { FastifyInstance } from 'fastify'

// This is the main function that initializes the database
const dbPlugin = async (app: FastifyInstance) => {
  const pool = new Pool({
    user: 'app_user',
    host: 'postgreSQL',
    database: 'users',
    password: 'apppassword',
    port: 5432,
    max: 20, // maximum number of clients in the pool 
    idleTimeoutMillis: 30000, // close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
  })
  // test the connection to the database
  const client = await pool.connect()
  try {
    await client.query('SELECT NOW()')
    console.log('✅ Database connection successful')
  } catch (err) {
    console.error('❌ Database connection failed:', err)
    throw err
  } finally {
    client.release()  // release the client back to the pool
  } 
  

  // Decorate the fastify instance with the db instance
  app.decorate('db', pool)

  // Add a hook to close the database connection when fastify closes
  app.addHook('onClose', async () => {
    await pool.end()
  })
  console.log('🔄 Database plugin initialized')
}
export default fp(dbPlugin)