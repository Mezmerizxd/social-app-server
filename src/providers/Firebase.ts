// Dependencies
import * as firebaseAdmin from 'firebase-admin';

// Middlewares
import Log from '../middlewares/Log';

// Providers
import {Config} from "../providers/Config";

class Firebase {
    public firebase: firebaseAdmin.app.App;
    public database: firebaseAdmin.database.Database;
    private firebaseKey: any;

    constructor() {
        this.firebaseKey = {
            type: Config.config().fbType,
            project_id: Config.config().fbProjectId,
            private_key_id: Config.config().fbPrivateKeyId,
            private_key: Config.config().fbPrivateKey,
            client_email: Config.config().fbClientEmail,
            client_id: Config.config().fbClientId,
            auth_uri: Config.config().fbAuthUri,
            token_uri: Config.config().fbTokenUri,
            auth_provider_x509_cert_url: Config.config().fbAuthProvider,
            client_x509_cert_url: Config.config().fbClientCertUrl
        };
    }

    public Initialize = async () => {
        Log.info('[Firebase] Initializing');
        try {
            this.firebase = firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(this.firebaseKey),
                databaseURL:
                Config.config().fbDatabaseUrl,
            });
            this.database = firebaseAdmin.database(this.firebase);
        } catch (error) {
            Log.warn(`[Firebase] Failed to initialize Firebase ${error}`);
        }
        Log.info('[Firebase] Ready');
    };
}

export default new Firebase();
