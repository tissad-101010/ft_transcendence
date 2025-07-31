/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 14:43:43 by tissad            #+#    #+#             */
/*   Updated: 2025/07/25 16:38:37 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file initializes the database connection and sets up the database

// fastify-plugin is used to create a plugin for fastify
// fp is a function that wraps the plugin
import fp from 'fastify-plugin'
// Database is imported from better-sqlite3
import Database from 'better-sqlite3'

import { FastifyInstance } from 'fastify';
// This is the main function that initializes the database
const dbPlugin = async (app: FastifyInstance) => {
    // Create a new database instance
  const db = new Database('/data/db.sqlite')

    // Create a users table if it does not exist
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL    
    );
  `).run()

    // Decorate the fastify instance with the db instance
  app.decorate('db', db)

  // Add a hook to close the database connection when fastify closes
  app.addHook('onClose', async () => {
    db.close()
  })
}
export default fp(dbPlugin)