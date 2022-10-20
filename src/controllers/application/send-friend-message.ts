// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import Authorizer from '../../classes/Authorizer';

// Classes
import Generator from '../../classes/Generator';

interface SendFriendMessageProps {
    messageContent: string;
    userId: number;
    authorization: string;
}

class SendFriendMessage {
    public static async perform(data: SendFriendMessageProps, socket) {
        Log.debug('[App] SendFriendMessage is performing...');
        const user = await Authorizer.App(data.authorization, null);
        if (user.authorized === true) {
            // Create message id
            const messageId = await Generator.DirectMessage_MessageId(
                data.userId + user?.data?.userId
            );

            // Stack data
            const messageData = {
                messageId: messageId.data,
                userId: user.data?.userId,
                username: user.data?.username,
                dateSent: new Date().toString(),
                content: data.messageContent,
                avatar: user.data?.avatar || 'https://i.pravatar.cc/300',
            };

            // Return data
            socket.emit(
                `send_friend_message_${data.userId + user.data?.userId}`,
                messageData
            );

            // Insert data
            const newFbDirectMessage = Firebase.database.ref(
                `social_app/direct_messages/${
                    data.userId + user.data?.userId
                }/messages/`
            );
            // Get existing messages
            let messages: any = [];
            if ((await newFbDirectMessage.get()).toJSON()) {
                (await newFbDirectMessage.get()).forEach((child) => {
                    let directMessage: any = child.toJSON();
                    if (directMessage) {
                        messages.push(directMessage);
                    }
                });
            }
            messages.push(messageData);
            await newFbDirectMessage.set(messages);
        }
        Log.debug('[App] SendFriendMessage is done');
    }
}

export default SendFriendMessage;
