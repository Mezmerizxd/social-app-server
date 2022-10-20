// Providers
import Express from './Express';

class App {
    public startServer(): void {
        Express.Initialize();
    }
}
export default new App();
