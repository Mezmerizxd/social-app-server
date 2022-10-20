// Dependencies
import * as socketio from 'socket.io';

// Controllers
import SendFriendMessage from '../controllers/application/send-friend-message';

const Sockets = (io: any, socket: socketio.Socket) => {
    socket.on('handleSendFriendMessage', (data) =>
        SendFriendMessage.perform(data, io)
    );
};

export default Sockets;
