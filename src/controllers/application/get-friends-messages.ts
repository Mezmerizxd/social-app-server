// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import AuthorizedAccess from '../../classes/Authorizer';

interface GetFriendsMessagesProps {
    userId: number;
}

class GetFriendsMessages {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] GetFriendsMessages is performing...');
        const reqData: GetFriendsMessagesProps = req.body;
        const user = await AuthorizedAccess.App(req.headers.authorization, res);
        if (user.authorized === true) {
            const messages = [];
            const directMessageId = reqData.userId + user.data?.userId;

            const fbFriendUserAccount = Firebase.database.ref(
                `social_app/user_account/${reqData.userId}`
            );
            if (!(await fbFriendUserAccount.get()).toJSON()) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'Friend does not exist.',
                });
                return;
            }

            // Get direct message
            let directMessage = null;
            const fbDirectMessages = Firebase.database
                .ref(`social_app`)
                .child('direct_messages')
                .orderByChild('directMessageId')
                .equalTo(directMessageId)
                .limitToFirst(1);
            if ((await fbDirectMessages.get()).toJSON()) {
                (await fbDirectMessages.get()).forEach((child) => {
                    directMessage = child.toJSON();

                    if (directMessage?.messages) {
                        Object.keys(directMessage.messages).forEach(
                            (message) => {
                                messages.push(directMessage.messages[message]);
                            }
                        );
                    }
                });
            } else {
                const fbUserData = Firebase.database.ref(
                    `social_app/direct_messages/${directMessageId}`
                );
                await fbUserData.set({
                    directMessageId: directMessageId,
                    messages: [],
                    users: [reqData.userId, user.data?.userId],
                });
            }

            // Return the data
            res.status(200).json({
                success: true,
                error: false,
                errorMessage: null,
                data: {
                    directMessageId: directMessageId,
                    messages: messages,
                },
            });
        }
        Log.debug('[App] GetFriendsMessages is done');
    }
}

export default GetFriendsMessages;
