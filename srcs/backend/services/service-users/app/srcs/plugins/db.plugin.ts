/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 14:43:43 by tissad            #+#    #+#             */
/*   Updated: 2025/10/23 17:10:17 by tissad           ###   ########.fr       */
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
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    max:  Number(process.env.DB_MAX_CLIENTS) || 20, // maximum number of clients in the pool 
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000, // close idle clients after 30 seconds
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT) || 2000, // return an error after 2 seconds if connection could not be established
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