/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.type.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 15:14:54 by tissad            #+#    #+#             */
/*   Updated: 2025/10/24 18:45:59 by tissad           ###   ########.fr       */
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
  data: any;
}

// session data type
export interface DataResponse {
  userId: number;
  username: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  email2FA: boolean;
  phone2FA: boolean;
  authenticator2FA: boolean;
  enabled2FA: boolean;
  accessToken: string; // JWT access token
  refreshToken: string; // JWT refresh token
}