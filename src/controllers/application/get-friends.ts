// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../providers/Firebase';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import Authorizer from '../../classes/Authorizer';

class GetFriends {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] GetFriends is performing...');
        const user = await Authorizer.App(req.headers.authorization, res);
        if (user.authorized === true) {
            const friends = [];

            // Check if user has friends
            if (user?.data?.friends && user?.data?.friends != null) {
                // Get the user data from each friend
                const friendIds = [];
                Object.keys(user.data?.friends).forEach(async (friend) => {
                    friendIds.push(user.data?.friends[friend]);
                });

                for (let i = 0; i < friendIds.length; i++) {
                    const fbUserData = Firebase.database.ref(
                        `social_app/user_data/${user.data?.friends[i]}`
                    );
                    const fbUserDataResp: any = await fbUserData.get();
                    if (fbUserDataResp.toJSON()) {
                        friends.push({
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
                data: friends,
            });
        }
        Log.debug('[App] GetFriends is done');
    }
}

export default GetFriends;
