// Dependencies
import * as sjcl from 'sjcl';
import Firebase from '../../providers/Firebase';
import { Request, Response } from 'express';

// Middlewares
import Log from '../../middlewares/Log';

interface LoginRequestProps {
    password: string;
    email: string;
}

class Login {
    /**
     *
     * @param req '{}'
     * @param res '{}
     * @returns
     */
    public static async perform(req: Request, res: Response) {
        Log.debug('[Auth] Login is performing.');
        const reqData: LoginRequestProps = req.body;

        // Check stage 1
        if (!reqData.email) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Username is required.',
            });
            return;
        }
        if (!reqData.password) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Password is required.',
            });
            return;
        }

        // Check stage 2
        let account = null;
        const fbUserAccount = Firebase.database
            .ref(`social_app`)
            .child('user_account')
            .orderByChild('email')
            .equalTo(reqData.email)
            .limitToFirst(1);
        if (!(await fbUserAccount.get()).toJSON()) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Email is not registered.',
            });
            return;
        } else {
            await (
                await fbUserAccount.get()
            ).forEach((child) => {
                account = child.toJSON();
            });
        }

        // Encrypt password
        const encryptedPassword = sjcl.codec.hex.fromBits(
            sjcl.hash.sha256.hash(reqData.password)
        );

        if (account.password !== encryptedPassword) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Password is incorrect.',
            });
            return;
        }
        if (
            reqData.email === account.email &&
            encryptedPassword === account.password
        ) {
            // Get user account
            const fbUserData = Firebase.database.ref(
                `social_app/user_data/${account.userId}`
            );
            const fbUserDataResp: any = (await fbUserData.get()).toJSON();
            if (!fbUserDataResp) {
                res.status(200).json({
                    success: false,
                    error: true,
                    errorMessage: 'No user data found',
                });
                return;
            }
            // Return data
            res.status(200).json({
                success: true,
                error: false,
                errorMessage: null,
                data: {
                    userId: fbUserDataResp.userId,
                    username: fbUserDataResp.username,
                },
                authorization: fbUserDataResp.authorization,
            });
        }
        Log.debug('[Auth] Login successfully finished performing.');
        return;
    }
}

export default Login;
