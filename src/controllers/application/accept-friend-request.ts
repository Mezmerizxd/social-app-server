// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import Authorizer from '../../classes/Authorizer';

interface AcceptFriendRequestProps {
    userId: number;
}

class AcceptFriendRequest {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] AcceptFriendRequest is performing...');
        const reqData: AcceptFriendRequestProps = req.body;
        const user = await Authorizer.App(req.headers.authorization, res);
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
            const userSentRequests = [];
            const userReceivedRequests = [];
            if (user.data?.friendRequests?.sent) {
                Object.keys(user.data?.friendRequests?.sent).forEach(
                    (request) => {
                        userSentRequests.push(
                            user.data?.friendRequests?.sent[request]
                        );
                    }
                );
            }
            if (user.data?.friendRequests?.received) {
                Object.keys(user.data.friendRequests?.received).forEach(
                    (request) => {
                        userReceivedRequests.push(
                            user.data.friendRequests?.received[request]
                        );
                    }
                );
            }

            // Get sent and received request from friend
            const friendSentRequests = [];
            const friendReceivedRequests = [];
            if (friendUserData?.friendRequests?.sent) {
                Object.keys(friendUserData?.friendRequests?.sent).forEach(
                    (request) => {
                        friendSentRequests.push(
                            friendUserData?.friendRequests?.sent[request]
                        );
                    }
                );
            }
            if (friendUserData?.friendRequests?.received) {
                Object.keys(friendUserData?.friendRequests?.received).forEach(
                    (request) => {
                        friendReceivedRequests.push(
                            friendUserData?.friendRequests?.received[request]
                        );
                    }
                );
            }

            // Check friend sent them a request
            if (!friendSentRequests?.includes(user.data.userId)) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: `You do not have a request from ${user.data.username}`,
                });
                return;
            }

            // Check user received a request
            if (!userReceivedRequests?.includes(friendUserData.userId)) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: `You did not receive a request from ${friendUserData.username}`,
                });
                return;
            }

            // Get friends from user
            const userFriends = [];
            let userAlreadyFriends = false;
            if (user.data?.friends) {
                Object.keys(user.data?.friends).forEach((friend) => {
                    if (user.data?.friends[friend] === friendUserData.userId)
                        userAlreadyFriends = true;
                    userFriends.push(user.data?.friends[friend]);
                });
            }
            if (userAlreadyFriends) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'You are already friends',
                });
                return;
            }
            userFriends.push(friendUserData.userId);

            // Get friends from friend
            const friendFriends = [];
            let friendAlreadyFriends = false;
            if (friendUserData?.friends) {
                Object.keys(friendUserData?.friends).forEach((friend) => {
                    if (friendUserData?.friends[friend] === user.data.userId)
                        friendAlreadyFriends = true;
                    friendFriends.push(friendUserData?.friends[friend]);
                });
            }
            if (friendAlreadyFriends) {
                res.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'You are already friends',
                });
                return;
            }
            friendFriends.push(user.data.userId);

            // Insert data
            // User
            await Firebase.database
                .ref(`social_app/user_data/${user.data.userId}/friends`)
                .set(userFriends);
            // Friend
            await Firebase.database
                .ref(`social_app/user_data/${friendUserData.userId}/friends`)
                .set(friendFriends);

            // Remove requests
            // User
            await Firebase.database
                .ref(
                    `social_app/user_data/${user.data.userId}/friendRequests/received`
                )
                .set(
                    userReceivedRequests.filter(
                        (request) => request !== friendUserData.userId
                    )
                );
            await Firebase.database
                .ref(
                    `social_app/user_data/${user.data.userId}/friendRequests/sent`
                )
                .set(
                    userSentRequests.filter(
                        (request) => request !== friendUserData.userId
                    )
                );
            // Friend
            await Firebase.database
                .ref(
                    `social_app/user_data/${friendUserData.userId}/friendRequests/received`
                )
                .set(
                    friendReceivedRequests.filter(
                        (request) => request !== user.data.userId
                    )
                );
            await Firebase.database
                .ref(
                    `social_app/user_data/${friendUserData.userId}/friendRequests/sent`
                )
                .set(
                    friendSentRequests.filter(
                        (request) => request !== user.data.userId
                    )
                );

            // Return the data
            res.status(200).json({
                success: true,
                error: false,
                errorMessage: null,
            });
        }
        Log.debug('[App] AcceptFriendRequest is done');
    }
}

export default AcceptFriendRequest;
