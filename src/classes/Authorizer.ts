// Dependencies
import * as express from 'express';

// Providers
import Firebase from '../providers/Firebase';

interface ReturnProps {
    data?: any;
    authorized: boolean;
}

class Authorizer {
    public App = async (
        token: string,
        resHandler: express.Response
    ): Promise<ReturnProps> => {
        if (!token) {
            if (resHandler) {
                resHandler.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'No authorization token was passed.',
                });
            }
            return { authorized: false };
        }
        let fbUserDataResp = null;
        const fbUserData = Firebase.database
            .ref(`social_app`)
            .child('user_data')
            .orderByChild('authorization')
            .equalTo(token)
            .limitToFirst(1);
        (await fbUserData.get()).forEach((child) => {
            fbUserDataResp = child.toJSON();
        });
        if (fbUserDataResp) {
            return { data: fbUserDataResp, authorized: true };
        } else {
            if (resHandler) {
                resHandler.status(400).json({
                    success: false,
                    error: true,
                    errorMessage: 'Refused authorization',
                });
            }
            return { authorized: false };
        }
    };
}

export default new Authorizer();
