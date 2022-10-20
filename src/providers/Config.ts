// Dependencies
import { Application } from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as sysexec from 'child_process';

// Middleware
import Log from '../middlewares/Log';

export class Config {
    public static config(): any {
        dotenv.config({ path: path.join(__dirname, '../../.env') });
        const anotherExpressBoilerplateVersion =
            process.env.ANOTHER_EXPRESS_BOILERPLATE_VERSION;
        const url = process.env.APP_URL || `http://localhost:3000`;
        const port = process.env.PORT || 3000;
        const socketPort = process.env.SOCKET_PORT || 3001;
        const useCluster = process.env.USE_CLUSTER || false;

        const name = process.env.APP_NAME || 'App Name';
        const year = new Date().getFullYear();
        const copyright = `Copyright ${year} ${name} | All Rights Reserved`;
        const company = process.env.COMPANY_NAME || 'App Name';
        const description = process.env.APP_DESCRIPTION || 'About Me!';

        const isCORSEnabled = process.env.CORS_ENABLED || 'true';
        const apiPrefix = process.env.API_PREFIX || 'api';

        const useGithub = process.env.USE_GITHUB || 'false';
        if (useGithub === 'true') {
            if (
                !process.env.GITHUB_USERNAME ||
                !process.env.GITHUB_PRIVATE_KEY ||
                !process.env.GITHUB_REPO_OWNER ||
                !process.env.GITHUB_REPO_NAME
            ) {
                Log.error(
                    'Github credentials are not set! Make a .env file with the following variables: GITHUB_USERNAME, GITHUB_PRIVATE_KEY, GITHUB_REPO_OWNER, GITHUB_REPO_NAME'
                );
                process.exit(1);
            }
        }
        const githubUsername = process.env.GITHUB_USERNAME;
        const githubPrivateKey = process.env.GITHUB_PRIVATE_KEY;
        const githubRepoOwner = process.env.GITHUB_REPO_OWNER;
        const githubRepoName = process.env.GITHUB_REPO_NAME;
        const githubRepoBranch = process.env.GITHUB_REPO_BRANCH || 'gh-pages';
        let staticWebRepoUrl = '';
        if (process.env.GITHUB_IS_PRIVATE === 'true') {
            staticWebRepoUrl = `https://${githubUsername}:${githubPrivateKey}@github.com/${githubRepoOwner}/${githubRepoName}`;
        } else {
            staticWebRepoUrl = `https://github.com/${githubRepoOwner}/${githubRepoName}`;
        }

        const fbType = process.env.FIREBASE_TYPE;
        const fbProjectId = process.env.FIREBASE_PROJECT_ID;
        const fbPrivateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
        const fbPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
        const fbClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const fbClientId = process.env.FIREBASE_CLIENT_ID;
        const fbAuthUri = process.env.FIREBASE_AUTH_URI;
        const fbTokenUri = process.env.FIREBASE_TOKEN_URI;
        const fbAuthProvider = process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL;
        const fbClientCertUrl = process.env.FIREBASE_CLIENT_X509_CERT_URL;
        const fbDatabaseUrl = process.env.FIREBASE_DATABASE_URL;

        return {
            anotherExpressBoilerplateVersion,
            apiPrefix,
            company,
            copyright,
            description,
            isCORSEnabled,
            name,
            port,
            socketPort,
            url,
            useGithub,
            githubRepoOwner,
            githubRepoName,
            githubRepoBranch,
            staticWebRepoUrl,
            useCluster,
            fbClientCertUrl,
            fbAuthProvider,
            fbType,
            fbProjectId,
            fbPrivateKeyId,
            fbPrivateKey,
            fbClientEmail,
            fbClientId,
            fbAuthUri,
            fbTokenUri,
            fbDatabaseUrl,
        };
    }

    public static Initialize(_express: Application): Application {
        if (!fs.existsSync(path.join(__dirname, '../../.env'))) {
            Log.warn(
                '[Config] No .env file was found, creating a new one. PLEASE EDIT IT.'
            );
            sysexec.execSync('cp .env.example .env');
            process.exit(-1);
        }

        _express.locals.app = this.config();
        return _express;
    }
}
