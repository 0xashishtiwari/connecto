import {io , Socket} from 'socket.io-client';
let socket: Socket | null = null;
let socketUrl = 'http://localhost:8000';

export const getSocket = () :Socket=>{
    if(!socket){
        socket = io(socketUrl , {
            transports: ['websocket']
        });
    }
    return socket;
}