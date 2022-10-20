// Dependencies
import * as express from 'express';

// Middlewares
import Log from '../middlewares/Log';

class TestController {
    public static async perform(req: express.Request, res: express.Response) {
        const messages = [
            'Hello World',
            'Hello',
            'How are you?',
            'I know where you live',
            'Look out your window',
            'dlroW olleH',
        ];
        const message = Math.floor(Math.random() * messages.length);

        Log.debug('[Controllers] TestController is performing...');
        res.json({
            date: new Date().toISOString(),
            // random message
            message: messages[message],
        });
        Log.debug('[Controllers] TestController is done');
    }

    public static socket(): void {
        Log.debug('[Socket] Connection closed.');
    }
}

export default TestController;
