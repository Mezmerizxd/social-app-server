// Dependencies

// Middlewares
import Log from '../../middlewares/Log';

class Friends {
    public static perform(req: any, res: any) {
        Log.debug('[Friends] Api was used.');
        const debugFriends = [
            {
                id: 1,
                username: '[debug] hello 123',
                presence: 'Call of Duty',
                presenceType: 'game',
                presenceLastUpdated: new Date().toLocaleString(),
                online: true,
                avatar: 'https://i.pravatar.cc/300',
            },
            {
                id: 2,
                username: '[debug] test user 321',
                presence: 'Grand Theft Auto V',
                presenceType: 'game',
                presenceLastUpdated: new Date().toLocaleString(),
                online: true,
                avatar: 'https://i.pravatar.cc/300',
            },
            {
                id: 3,
                username: '[debug] guest 557',
                presence: null,
                presenceType: null,
                presenceLastUpdated: new Date().toLocaleString(),
                online: false,
                avatar: 'https://i.pravatar.cc/300',
            },
            {
                id: 4,
                username: '[debug] UK > USA',
                presence: 'Netlfix',
                presenceType: 'custom',
                presenceLastUpdated: new Date().toLocaleString(),
                online: true,
                avatar: 'https://i.pravatar.cc/300',
            },
        ];
        res.status(200).json({
            success: true,
            error: false,
            data: debugFriends,
        });
        return;
    }
}

export default Friends;
