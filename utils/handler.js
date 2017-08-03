const SocialGlobal = require('./managers/socialGlobal');
const SocialLocal = require('./managers/socialLocal');
const Guilds = require('./managers/guilds');
const Clock = require('./managers/clock');

const clean = require('../functions/clean');
const Dashboard = require('../functions/dashboard');

class Handler {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });

        this.guilds = new Guilds();
        this.clock = new Clock(client);

        this.dashboard = null;

        this.social = {
            global: new SocialGlobal(),
            local: new SocialLocal()
        };
    }

    async init() {
        await this.clock.init();
        this.dashboard = new Dashboard(this.client);
        clean.init(this.client);
    }

}

module.exports = Handler;
