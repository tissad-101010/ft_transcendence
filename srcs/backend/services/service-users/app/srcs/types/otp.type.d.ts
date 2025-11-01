/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.type.d.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:52:49 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 11:31:10 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */




export interface OtpEmailRequest {
  email: string;
}

export interface VerifyOtpEmailRequest {
  email: string;
  otp: string;
}
