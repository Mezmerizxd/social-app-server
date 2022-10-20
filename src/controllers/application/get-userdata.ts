// Dependencies
import { Request, Response } from 'express';

// Middlewares
import Log from '../../middlewares/Log';

// Classes
import AuthorizedAccess from '../../classes/Authorizer';

class GetUserData {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] GetUserData is performing...');
        const user = await AuthorizedAccess.App(req.headers.authorization, res);
        if (user.authorized === true) {
            res.status(200).json({
                success: true,
                error: false,
                data: user.data,
            });
        }
        Log.debug('[App] GetUserData is done');
    }
}

export default GetUserData;
