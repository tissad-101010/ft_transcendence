/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.type.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 15:18:06 by tissad            #+#    #+#             */
/*   Updated: 2025/07/25 15:19:44 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import 'fastify'
import Database from 'better-sqlite3'

// Extend the FastifyInstance interface to include the db property
declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database
  }
}
