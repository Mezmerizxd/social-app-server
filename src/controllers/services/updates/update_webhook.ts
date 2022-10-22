// Dependencies
import { Request, Response } from 'express';

// Providers
import Firebase from '../../../providers/Firebase';

// Middlewares
import Log from '../../../middlewares/Log';

class UpdateWebhook {
    public static async perform(req: Request, res: Response) {
        Log.debug('[App] UpdateWebhook is performing...');
        const reqData = req.body

        if (reqData.ref === "refs/heads/main") {
            let commits = [];
            reqData.commits.forEach(commit => {
                commits.push({
                    message: commit.message,
                    url: commit.url,
                    timestamp: commit.timestamp,
                    author: commit.author.username
                })
            });
            const Data = {
                repo: reqData.repository.name,
                repoUrl: reqData.repository.url,
                sender: reqData.sender.login,
                pusher: reqData.pusher.name,
                commits: commits
            }

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
            updates.push(Data)
            fbUpdates.set(updates)
        }

        // Return the data
        res.status(200).json({
            success: true,
            error: false,
            errorMessage: null,
        });
        
        Log.debug('[App] UpdateWebhook is done');
    }
}

export default UpdateWebhook;
