// Dependencies
import * as path from 'path';
import * as express from 'express';
import * as fs from 'fs';
import * as exec from 'child_process';

// Providers
import { Config } from '../providers/Config';

// Middlewares
import Log from '../middlewares/Log';

class Statics {
    public static mount(_express: express.Application): express.Application {
        // Set the static web folder
        this.Initialize();
        if (
            Config.config().useGithub === 'true' &&
            process.env.NODE_ENV === 'production'
        ) {
            _express.use(
                express.static(
                    path.join(
                        __dirname,
                        `../../client/${Config.config().githubRepoName}`
                    )
                )
            );
        }
        return _express;
    }

    private static Initialize(): void {
        // Install/Update the static web repository
        if (
            Config.config().useGithub === 'true' &&
            process.env.NODE_ENV === 'production'
        ) {
            try {
                this.installFromGithubBranch();
            } catch (error) {
                Log.warn(
                    `[Statics] Failed to clone ${
                        Config.config().githubRepoName
                    }. Server will not have any static files to provide.`
                );
            }
        }
    }

    public static installFromGithubBranch() {
        // Check client folder exists
        if (!fs.existsSync(path.join(__dirname, '../../client'))) {
            fs.mkdirSync(path.join(__dirname, '../../client'));
        }
        // Check the web repository exists
        if (
            !fs.existsSync(
                path.join(
                    __dirname,
                    `../../client/${Config.config().githubRepoName}`
                )
            )
        ) {
            Log.info(
                `[Statics] Cloning ${
                    Config.config().githubRepoName
                } repository...`
            );
            // Clone the repository
            exec.execSync(
                `cd ${path.join(__dirname, '../../client')} && git clone ${
                    Config.config().staticWebRepoUrl
                }`
            );
        }
        // Update the web repository
        Log.info(`[Statics] Updating ${Config.config().githubRepoName}...`);
        try {
            // Update the repository
            exec.execSync(
                `cd ${path.join(
                    __dirname,
                    `../../client/${Config.config().githubRepoName}`
                )} && git pull`
            );
            // Switch to client branch
            // check if asset-manifest file exists
            if (
                !fs.existsSync(
                    path.join(
                        __dirname,
                        `../../client/${
                            Config.config().githubRepoName
                        }/asset-manifest.json`
                    )
                )
            ) {
                Log.info(
                    `[Statics] Switching to branch ${
                        Config.config().githubRepoBranch
                    }...`
                );
                // Switch to client branch
                exec.execSync(
                    `cd ${path.join(
                        __dirname,
                        `../../client/${Config.config().githubRepoName}`
                    )} && git checkout ${Config.config().githubRepoBranch}`
                );
            }
            Log.info(
                `[Statics] Completed Updating ${Config.config().githubRepoName}`
            );
            return;
        } catch (error) {
            try {
                Log.info(
                    `[Statics] Deleting ${
                        Config.config().githubRepoName
                    } repository...`
                );
                exec.execSync(
                    `cd ${path.join(__dirname, '../../client')} && rm -rf ${
                        Config.config().githubRepoName
                    }`
                );
                this.installFromGithubBranch();
            } catch (error) {
                Log.error(`[Statics] ${error}`);
                return;
            }
        }
    }
}

export default Statics;
