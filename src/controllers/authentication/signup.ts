// Dependencies
import * as sjcl from 'sjcl';
import { Request, Response } from 'express';

// Middlewares
import Log from '../../middlewares/Log';

// Providers
import Firebase from '../../providers/Firebase';

// Classes
import Generate from '../../classes/Generator';

// Auth
import Config from './misc/config';

interface SignupRequestProps {
    username: string;
    password: string;
    email: string;
}

class SignUp {
    public static async perform(req: Request, res: Response) {
        Log.debug('[Auth] SignUp is performing.');
        const reqData: SignupRequestProps = req.body;
        // Check stage 1
        if (!reqData.username) {
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
        if (reqData.username.length > Config.max_username_length) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Username is too long.',
            });
            return;
        }
        if (reqData.password.length < Config.min_password_length) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Password is too short.',
            });
            return;
        }
        if (
            Config.illegal_username_characters.some((char: string) =>
                reqData.username.includes(char)
            )
        ) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Username contains illegal characters.',
            });
            return;
        }

        const fbUserData = Firebase.database
            .ref(`social_app`)
            .child('user_data')
            .orderByChild('username')
            .equalTo(reqData.username)
            .limitToFirst(1);
        if ((await fbUserData.get()).toJSON()) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Username is already taken',
            });
            return;
        }

        const fbUserAccount = Firebase.database
            .ref(`social_app`)
            .child('user_account')
            .orderByChild('email')
            .equalTo(reqData.email)
            .limitToFirst(1);
        if ((await fbUserAccount.get()).toJSON()) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Email is already taken.',
            });
            return;
        }

        // Check stage 4
        const generatedUserId = await Generate.UserId();
        if (!generatedUserId) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Something went wrong',
            });
            return;
        }

        const generatedToken = await Generate.AuthorizationToken();
        if (!generatedToken) {
            res.status(400).json({
                success: false,
                error: true,
                errorMessage: 'Something went wrong',
            });
            return;
        }

        // Encrypt password
        const encryptedPassword = sjcl.codec.hex.fromBits(
            sjcl.hash.sha256.hash(reqData.password)
        );

        // Set vars
        const CreationDate = new Date();

        // Insert account data
        const newFbUserAccount = Firebase.database.ref(
            `social_app/user_account/${generatedUserId.data}`
        );
        await newFbUserAccount.set({
            userId: generatedUserId.data,
            email: reqData.email,
            password: encryptedPassword,
            creation_date: CreationDate,
        });

        const AccountData = {
            userId: generatedUserId.data,
            authorization: generatedToken.data,
            username: reqData.username,
        };

        // Insert user data
        const newFbUserData = Firebase.database.ref(
            `social_app/user_data/${generatedUserId.data}`
        );
        await newFbUserData.set(AccountData);

        res.status(200).json({
            success: true,
            error: false,
            authorization: generatedToken.data,
        });

        Log.debug('[Auth] SignUp successfully finished performing.');
        return;
    }
}

export default SignUp;
