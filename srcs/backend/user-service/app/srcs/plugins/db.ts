/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 14:43:43 by tissad            #+#    #+#             */
/*   Updated: 2025/08/05 17:15:26 by tissad           ###   ########.fr       */
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
    connectionString: 'postgres://postgres@postgreSQL:5432/UserService'
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