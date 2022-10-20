// Dependencies
import { Router } from 'express';
import * as path from 'path';
import { Config } from '../providers/Config';

const router = Router();

router.get('/*', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            `../../client/${Config.config().githubRepoName}/index.html`
        )
    );
});

export default router;
