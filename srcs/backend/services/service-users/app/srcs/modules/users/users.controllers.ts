/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:29:01 by glions            #+#    #+#             */
/*   Updated: 2025/11/20 15:38:06 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from 'fastify';

import { UsersService } from '../users/users.services';
import { CredentialUtils } from '../../utils/credential.utils';
import { JwtUtils } from '../../utils/jwt.utils';

/***********************************/
/*     User Controllers            */
/***********************************/

