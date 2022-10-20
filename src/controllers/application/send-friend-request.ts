// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import Authorizer from '../../classes/Authorizer';

interface SendFriendRequestProps {
    username: string;
}

class SendFriendRequest {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] SendFriendRequest is performing...');
        const reqData: SendFriendRequestProps = req.body;
        const user = await Authorizer.App(req.headers.authorization, res);
        if (user.authorized === true) {
            if (reqData.username === null || '') {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'Please enter a username.',
                });
                return;
            }

            // Get friends user data
            let friendUserData = null;
            const fbFriendUserData: any = Firebase.database
                .ref(`social_app`)
                .child('user_data')
                .orderByChild('username')
                .equalTo(reqData.username)
                .limitToFirst(1);
            if (!(await fbFriendUserData.get()).toJSON()) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'User does not exist.',
                });
                return;
            } else {
                (await fbFriendUserData.get()).forEach((child) => {
                    friendUserData = child.toJSON();
                });
            }

            // TODO: Check if their already on eachovers sent/received requests, if so then auto add eachover

            // Check if request is already sent
            const sentRequests = [];
            let alreadySent = false;
            if (user.data?.friendRequests?.sent) {
                Object.keys(user.data?.friendRequests?.sent).forEach(
                    (request) => {
                        if (
                            user.data?.friendRequests.sent[request] ===
                            friendUserData.userId
                        )
                            alreadySent = true;
                        sentRequests.push(
                            user.data?.friendRequests.sent[request]
                        );
                    }
                );
            }
            if (alreadySent) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'Request already sent.',
                });
                return;
            }
            sentRequests.push(friendUserData.userId);

            // Check if request has already been received
            const receivedRequests = [];
            let alreadyReceived = false;
            if (friendUserData?.friendRequests?.received) {
                Object.keys(friendUserData.friendRequests?.received).forEach(
                    (request) => {
                        if (
                            friendUserData.friendRequests.received[request] ===
                            user.data.userId
                        )
                            alreadyReceived = true;
                        receivedRequests.push(
                            friendUserData.friendRequests.received[request]
                        );
                    }
                );
            }
            if (alreadyReceived) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'Request already sent.',
                });
                return;
            }
            receivedRequests.push(user.data.userId);

            // // Insert to user data
            await Firebase.database
                .ref(
                    `social_app/user_data/${user.data.userId}/friendRequests/sent`
                )
                .set(sentRequests);
            // // Insert to friends user data
            await Firebase.database
                .ref(
                    `social_app/user_data/${friendUserData.userId}/friendRequests/received`
                )
                .set(receivedRequests);

            // Return the data
            res.status(200).json({
                success: true,
                error: false,
                errorMessage: null,
            });
        }
        Log.debug('[App] SendFriendRequest is done');
    }
}

export default SendFriendRequest;
