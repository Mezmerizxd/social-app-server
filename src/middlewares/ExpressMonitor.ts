// Dependencies
import { Application } from 'express';
import * as expressStatusMonitor from 'express-status-monitor';

// Middlewares
import Log from './Log';

// Providers
import { Config } from '../providers/Config';

class ExpressMonitor {
    public mount(_express: Application): Application {
        Log.info('[Express Monitor] Starting...');
        const monitorOptions: object = {
            title: Config.config().name,
            path: '/status-monitor',
            spans: [
                {
                    interval: 1,
                    retention: 60,
                },
                {
                    interval: 5,
                    retention: 60,
                },
                {
                    interval: 15,
                    retention: 60,
                },
            ],
            chartVisibility: {
                mem: true,
                rps: true,
                cpu: true,
                load: true,
                statusCodes: true,
                responseTime: true,
            },
            healthChecks: [
                {
                    protocol: 'http',
                    host: 'localhost',
                    path: '/',
                    port: `${Config.config().port}`,
                },
                {
                    protocol: 'http',
                    host: 'localhost',
                    path: `/${Config.config().apiPrefix}`,
                    port: `${Config.config().port}`,
                },
            ],
        };
        _express.use(expressStatusMonitor(monitorOptions));
        return _express;
    }
}

export default new ExpressMonitor();
