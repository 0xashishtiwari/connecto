import express from 'express';
import { createServer } from 'http';
import {initializeGlobalSocketConnection} from './globalSocketConnection.js';
import {getGlobalSocketConnection} from './globalSocketConnection.js';

const app = express();
const httpServer = createServer(app);

initializeGlobalSocketConnection(httpServer);
const io = getGlobalSocketConnection();

io.on('connection' , (socket)=>{
    console.log('Signalling server: a user connected ' + socket.id);
    
    socket.on('join-room' , ({roomId})=>{
        socket.join(roomId);
        console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
        socket.to(roomId).emit('user-joined' , socket.id);
    })

    socket.on('offer' , ({offer, roomId})=>{
        console.log(`Received offer from ${socket.id}`);
        socket.to(roomId).emit('offer', offer);
    })

    socket.on('answer' , ({answer, roomId})=>{
        console.log(`Received answer from ${socket.id}`);
        socket.to(roomId).emit('answer', answer);
    })

    socket.on('ice-candidate', ({candidate, roomId}) => {
        console.log(`Received ICE candidate from ${socket.id}`);
        socket.to(roomId).emit('ice-candidate', candidate);
    })
})


httpServer.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});