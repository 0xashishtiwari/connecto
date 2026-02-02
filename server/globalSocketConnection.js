import { Server } from "socket.io";


let io = null;
export const initializeGlobalSocketConnection = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });
    io.on('connection', (socket) => {

        socket.on('disconnect', () => {
            console.log('user disconnected : ' +  socket.id);
        }
        );
    });
};

export const getGlobalSocketConnection = () => {
    if (!io) {
        throw new Error("Global socket connection has not been initialized.");
    }
    return io;
};