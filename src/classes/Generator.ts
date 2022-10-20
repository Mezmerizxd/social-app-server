// Dependencies
import * as crypto from 'crypto';

// Middlewares
import Log from '../middlewares/Log';

// Providers
import Firebase from '../providers/Firebase';

interface ReturnIdProps {
    data: number;
}

interface ReturnTokenProps {
    data: string;
}

class Generate {
    private max_id_size = 999999999999999;
    private max_token_byte = 64;
    private max_attempts = 5;

    public DirectMessage_MessageId = async (
        directMessageId: number
    ): Promise<ReturnIdProps> => {
        Log.debug('[Generator] DirectMessage_MessageId - starting');
        let created = false;
        let id = null;
        let attempts = 0;
        while (!created) {
            id = Math.floor(Math.random() * this.max_id_size);
            if (attempts === this.max_attempts) {
                Log.error('[Generator] DirectMessage_MessageId - max attempts');
                return { data: null };
            }
            const fbUserAccount = Firebase.database.ref(
                `social_app/direct_messages/${directMessageId}/messages/${id}`
            );
            const fbUserDataResp = (await fbUserAccount.get()).toJSON();
            if (!fbUserDataResp) created = true;
            attempts += 1;
        }
        Log.debug('[Generator] DirectMessage_MessageId - finished');
        return { data: id };
    };

    public UserId = async (): Promise<ReturnIdProps> => {
        Log.debug('[Generator] UserId - starting');
        let created = false;
        let id = null;
        let attempts = 0;
        while (!created) {
            id = Math.floor(Math.random() * this.max_id_size);
            if (attempts === this.max_attempts) {
                Log.error('[Generator] UserId - max attempts');
                return { data: null };
            }
            const fbUserAccount = Firebase.database.ref(
                `social_app/user_accounts/${id}`
            );
            const fbUserDataResp = (await fbUserAccount.get()).toJSON();
            if (!fbUserDataResp) created = true;
            attempts += 1;
        }
        Log.debug('[Generator] UserId - finished');
        return { data: id };
    };
    public AuthorizationToken = async (): Promise<ReturnTokenProps> => {
        Log.debug('[Generator] AuthorizationToken - starting');
        let created = false;
        let token = null;
        let attempts = 0;
        while (!created) {
            token = crypto.randomBytes(this.max_token_byte).toString('hex');
            if (attempts === this.max_attempts) {
                Log.error('[Generator] AuthorizationToken - max attempts');
                return { data: null };
            }
            const fbUserData = Firebase.database
                .ref(`social_app/`)
                .child('user_data')
                .orderByChild('authorization')
                .equalTo(token)
                .limitToFirst(1);
            const fbUserDataResp = (await fbUserData.get()).toJSON();
            if (!fbUserDataResp) created = true;
            attempts += 1;
        }
        Log.debug('[Generator] AuthorizationToken - finished');
        return { data: token };
    };
}

export default new Generate();
