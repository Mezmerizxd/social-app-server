// Dependencies
import * as os from 'os';
import * as _cluster from 'cluster';
import * as readline from 'readline';
const cluster = _cluster as unknown as _cluster.Cluster;

// Exceptions
import NativeEvent from './exceptions/NativeEvent';

import Log from './middlewares/Log';

// Providers
import App from './providers/App';
import { Config } from './providers/Config';

const args = process.argv.slice(2);

function start(): void {
    if (Config.config().useCluster === true) {
        if (cluster.isPrimary) {
            NativeEvent.process();
            const CPUS: any = os.cpus();
            CPUS.forEach(() => {
                setTimeout(() => {
                    cluster.fork();
                }, 1000);
            });
            NativeEvent.cluster(cluster);
        } else {
            App.startServer();
        }
    } else {
        App.startServer();
    }
}

if (process.env.NODE_ENV === 'production') {
    const protect = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    if (args[0] === 'bypass') {
        setTimeout(() => {
            return Promise;
        }, 500);
        start();
    } else {
        protect.question(
            '\x1b[35mYOU ARE ABOUT TO RUN THIS SERVER IN **PRODUCTION** MODE.\nYOU ARE ONLY SUPOSSED TO RUN THIS ON A SERVER\nARE YOU SURE YOU WANT TO CONTINUE?\x1b[0m \x1b[36my/N\x1b[0m\n> ',
            (ans) => {
                if (ans === 'N' || ans === 'n' || ans === '') {
                    process.exit(0);
                } else if (ans === 'Y' || ans === 'y') {
                    Log.info('Starting Server');
                    setTimeout(() => {
                        return Promise;
                    }, 500);
                    start();
                }
                protect.close();
            }
        );
    }
} else {
    start();
}
