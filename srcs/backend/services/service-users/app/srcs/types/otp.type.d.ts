/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ptp.d.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:52:49 by tissad            #+#    #+#             */
/*   Updated: 2025/09/16 18:52:50 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */




export interface OtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
