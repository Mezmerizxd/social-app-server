// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import Authorizer from '../../classes/Authorizer';

class GetFriendRequests {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] GetFriendRequests is performing...');
        const user = await Authorizer.App(req.headers.authorization, res);
        if (user.authorized === true) {
            const requestsSent = [];
            const requestsReceived = [];

            // Get sent requests
            if (
                user?.data?.friendRequests?.sent &&
                user?.data?.friendRequests?.sent !== null
            ) {
                // Get the user id from each request
                const userIds = [];
                Object.keys(user.data?.friendRequests.sent).forEach(
                    (request) => {
                        userIds.push(user.data?.friendRequests.sent[request]);
                    }
                );
                // Get user data from user ids
                for (let i = 0; i < userIds.length; i++) {
                    const fbUserData = Firebase.database.ref(
                        `social_app/user_data/${user.data?.friendRequests.sent[i]}`
                    );
                    const fbUserDataResp: any = await fbUserData.get();
                    if (fbUserDataResp.toJSON()) {
                        requestsSent.push({
                            userId: fbUserDataResp.toJSON().userId,
                            username: fbUserDataResp.toJSON().username,
                            avatar:
                                fbUserDataResp.toJSON()?.avatar ||
                                'https://i.pravatar.cc/300',
                        });
                    }
                }
            }

            // Get received requests
            if (
                user?.data?.friendRequests?.received &&
                user?.data?.friendRequests?.received !== null
            ) {
                // Get the user id from each request
                const userIds = [];
                Object.keys(user.data?.friendRequests.received).forEach(
                    (request) => {
                        userIds.push(
                            user.data?.friendRequests.received[request]
                        );
                    }
                );
                // Get user data from user ids
                for (let i = 0; i < userIds.length; i++) {
                    const fbUserData = Firebase.database.ref(
                        `social_app/user_data/${user.data?.friendRequests.received[i]}`
                    );
                    const fbUserDataResp: any = await fbUserData.get();
                    if (fbUserDataResp.toJSON()) {
                        requestsReceived.push({
                            userId: fbUserDataResp.toJSON().userId,
                            username: fbUserDataResp.toJSON().username,
                            avatar:
                                fbUserDataResp.toJSON()?.avatar ||
                                'https://i.pravatar.cc/300',
                        });
                    }
                }
            }

            // Return the data
            res.status(200).json({
                success: true,
                error: false,
                errorMessage: null,
                data: {
                    sent: requestsSent,
                    received: requestsReceived,
                },
            });
        }
        Log.debug('[App] GetFriendRequests is done');
    }
}

export default GetFriendRequests;
