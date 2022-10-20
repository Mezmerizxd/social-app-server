// Dependencies
import * as socketio from 'socket.io';

// Middleware
import Log from '../middlewares/Log';

// Routes
import Sockets from '../routes/Sockets';

class Socket {
    public g_socket: socketio.Socket;

    public Initialize(socketServer: socketio.Server): void {
        Log.info('[Socket] Initializing');
        socketServer.on('connection', (socket: socketio.Socket) => {
            Log.info('Socket Joined');
            this.g_socket = socket;
            socket.on('disconnect', () => Log.info('Socket Disconnected'));
            Sockets(socketServer, socket);
        });
    }
}

export default new Socket();
