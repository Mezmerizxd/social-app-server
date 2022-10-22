// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../../providers/Firebase';

// Middlewares
import Log from '../../../middlewares/Log';

// Classes
import Authorizer from '../../../classes/Authorizer';

class CheckForUpdates {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] CheckForUpdates is performing...');

        const fbUpdates = Firebase.database.ref(`social_app/updates`)
        const updates: any = [];
        if ((await fbUpdates.get()).toJSON()) {
            (await fbUpdates.get()).forEach((child) => {
                const update: any = child.toJSON();
                if (update) {
                    updates.push(update);
                }
            });
        }
        fbUpdates.set(updates)

        // Return the data
        res.status(200).json({
            success: true,
            error: false,
            errorMessage: null,
            data: JSON.stringify(updates)
        });
        
        Log.debug('[App] CheckForUpdates is done');
    }
}

export default CheckForUpdates;
