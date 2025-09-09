/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.type.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 15:14:54 by tissad            #+#    #+#             */
/*   Updated: 2025/09/09 14:33:46 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// export the SignupUserInput type or interface
export interface SignupUserInput {
  // define the properties here, e.g.:
  username: string;
  password: string;
  email: string;
}

// response data type for signup
export interface SignupResponse {
  message: string;
  id: number;
  username: string;
  email: string;
}


// export the SigninUserInput type or interface
export interface SigninUserInput {
  // define the properties here, e.g.:
  username: string;
  password: string;
}

// response data type for signin
export interface SigninResponse {
  message: string;
  id: number;
  username: string;
  accessToken: string; // JWT access token
  refreshToken: string; // JWT refresh token
}