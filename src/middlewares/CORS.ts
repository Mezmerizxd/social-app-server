// Dependencies
import * as cors from 'cors';
import { Application } from 'express';

// Providers
import { Config } from '../providers/Config';

class CORS {
    public mount(_express: Application): Application {
        if (Config.config().isCORSEnabled === 'true') {
            //_express.use(cors(options));
            _express.use(cors());
        }
        return _express;
    }
}

export default new CORS();
