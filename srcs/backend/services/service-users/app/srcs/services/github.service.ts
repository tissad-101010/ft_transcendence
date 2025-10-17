/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/17 16:56:59 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 18:34:19 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



export async function getGithubAccessToken(code: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  return response.json();
}

export async function getGithubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Fastify-App',
    },
  });

  return response.json();
}

