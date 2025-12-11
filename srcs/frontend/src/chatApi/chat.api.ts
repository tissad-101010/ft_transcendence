/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.api.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/29 12:20:32 by tissad             #+#    #+#             */
/*   Updated: 2025/11/29 12:20:34 by tissad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { authFetch } from "../auth/authFetch";

const API_URL = window.__ENV__.BACKEND_URL;

export class ChatApi {
    //start of chat api methods
    async startConversation(senderUsername: string, receiverUsername: string): Promise<any> {
        const payload = {
            senderUsername,
            receiverUsername
        };

        const response = await authFetch(`${API_URL}/chat/conversation/start-conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return await response.json();
    }
    
    // GET USER CONVERSATIONS
    async getUserConversations(username: string): Promise<any> {
        const response = await authFetch(`${API_URL}/chat/conversation/get-user-conversations?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    }


    // send a message from one user to another
    async sendMessage(senderUsername: string, receiverUsername: string, content: string ): Promise<any> {

        console.log("Envoi du message via chatApi:", content, "de", senderUsername, "à", receiverUsername);

        const message = {
            senderUsername,
            receiverUsername,
            content,
        };

        authFetch(`${API_URL}/chat/message/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        })
        .then(response => response.json())
    }

    //end of chat

}
export const chatApi = new ChatApi();