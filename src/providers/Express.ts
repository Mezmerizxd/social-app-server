// Dependencies
import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

// Providers
import Routes from './Routes';
import { Config } from './Config';
import Socket from './Socket';
import Firebase from './Firebase';

// Middlewares
import Kernal from '../middlewares/Kernel';
import Log from '../middlewares/Log';

class Express {
    public express: express.Application;
    public httpServer: http.Server;
    public ioServer: socketio.Server;

    constructor() {
        this.express = express();

        this.startHttp();
        this.startSocket();

        // Get the environment variables
        this.mountDotEnv();
        // Mount the middlewares
        this.mountMiddlewares();
        // Mount the routes
        this.mountRoutes();
        // Init database
        Firebase.Initialize();
    }

    private mountDotEnv(): void {
        // Load the .env file
        this.express = Config.Initialize(this.express);
    }

    private mountMiddlewares(): void {
        // Mount the Kernal middleware
        this.express = Kernal.Initialize(this.express);
    }

    private mountRoutes(): void {
        // Mount the static web
        this.express = Routes.mountWeb(this.express);
        this.express = Routes.mountApi(this.express);
    }

    private startHttp(): void {
        this.httpServer = http.createServer(this.express);
    }

    private startSocket(): void {
        this.ioServer = new socketio.Server();
        Socket.Initialize(this.ioServer);
    }

    public Initialize(): any {
        this.httpServer
            .listen(Config.config().port, () => {
                Log.info(
                    `[Server] Server is Online in ${
                        process.env.NODE_ENV === 'production'
                            ? 'PRODUCTION'
                            : 'DEVELOPMENT'
                    } Mode`
                );
            })
            .on('error', (err) => {
                console.log('Error:', err.message);
                Log.error(`${err}`);
            });

        this.ioServer.attach(Config.config().socketPort, {
            cors: { origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' },
        });
    }
}
export default new Express();
