/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ws.utils.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/03 12:10:51 by tissad            #+#    #+#             */
/*   Updated: 2025/12/03 12:51:00 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// WebSocket API for real-time chat communication

// class that handles WebSocket connections and messaging takes as parameter the url of the ws server
export class WsUtils {
    private socket: WebSocket;
    private isConnected: boolean = false;
    
    constructor(url: string) {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
            this.isConnected = true;
            console.log("WebSocket connection established.");
        }
        
        this.socket.onclose = () => {
            this.isConnected = false;
            console.log("WebSocket connection closed.");
        }
        
        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        }
    }
    
    // send a message via websocket
    sendMessage(message: any) {
        if (this.isConnected) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not connected. Message not sent.");
        }
    }   
    // listen for incoming messages
    onMessage(callback: (message: any) => void) {
        this.socket.addEventListener("message", (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                callback(data);
            } catch (error) {
                console.error("Erreur JSON:", error);
            }
        });
    }

    // close the websocket connection
    close() {
        this.socket.close();
        this.isConnected = false;
    }
}