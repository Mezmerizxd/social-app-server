// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import AuthorizedAccess from '../../classes/Authorizer';

interface RemoveFriendProps {
    userId: number;
}

class RemoveFriend {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] RemoveFriend is performing...');
        const reqData: RemoveFriendProps = req.body;
        const user = await AuthorizedAccess.App(req.headers.authorization, res);
        if (user.authorized === true) {
            // Check if user id is valid and then get the user data from id
            let friendUserData = null;
            const fbFriendUserData: any = Firebase.database
                .ref(`social_app`)
                .child('user_data')
                .orderByChild('userId')
                .equalTo(reqData.userId)
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

            // Get sent and received requests from user
            let userSentRequests = [];
            let userReceivedRequests = [];
            if (user.data?.friendRequests?.sent) {
                Object.keys(user.data?.friendRequests?.sent).forEach(
                    (request) => {
                        if (
                            user.data.friendRequests?.sent[request] !==
                            friendUserData.userId
                        ) {
                            userSentRequests.push(
                                user.data?.friendRequests?.sent[request]
                            );
                        }
                        // Log.debug("[App] RemoveFriend - userSentRequests set")
                    }
                );
            }
            if (user.data?.friendRequests?.received) {
                Object.keys(user.data.friendRequests?.received).forEach(
                    (request) => {
                        if (
                            user.data.friendRequests?.received[request] !==
                            friendUserData.userId
                        ) {
                            userReceivedRequests.push(
                                user.data.friendRequests?.received[request]
                            );
                        }
                        // Log.debug("[App] RemoveFriend - userReceivedRequests set")
                    }
                );
            }

            // Get sent and received request from friend
            let friendSentRequests = [];
            let friendReceivedRequests = [];
            if (friendUserData?.friendRequests?.sent) {
                Object.keys(friendUserData?.friendRequests?.sent).forEach(
                    (request) => {
                        if (
                            friendUserData?.friendRequests?.sent[request] !==
                            user.data.userId
                        ) {
                            friendSentRequests.push(
                                friendUserData?.friendRequests?.sent[request]
                            );
                        }
                        // Log.debug("[App] RemoveFriend - friendSentRequests set")
                    }
                );
            }
            if (friendUserData?.friendRequests?.received) {
                Object.keys(friendUserData?.friendRequests?.received).forEach(
                    (request) => {
                        if (
                            friendUserData?.friendRequests?.received[
                                request
                            ] !== user.data.userId
                        ) {
                            friendReceivedRequests.push(
                                friendUserData?.friendRequests?.received[
                                    request
                                ]
                            );
                        }
                        // Log.debug("[App] RemoveFriend - friendReceivedRequests set")
                    }
                );
            }

            // Set the data
            // User
            await Firebase.database
                .ref(
                    `social_app/user_data/${user.data.userId}/friendRequests/sent`
                )
                .set(userSentRequests);
            await Firebase.database
                .ref(
                    `social_app/user_data/${user.data.userId}/friendRequests/received`
                )
                .set(userReceivedRequests);
            // Friend
            await Firebase.database
                .ref(
                    `social_app/user_data/${friendUserData.userId}/friendRequests/sent`
                )
                .set(friendSentRequests);
            await Firebase.database
                .ref(
                    `social_app/user_data/${friendUserData.userId}/friendRequests/received`
                )
                .set(friendReceivedRequests);

            res.status(200).json({
                success: true,
                error: false,
            });
        }
        Log.debug('[App] RemoveFriend is done');
    }
}

export default RemoveFriend;
