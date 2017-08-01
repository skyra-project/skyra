const Guilds = require('./user/guilds');

module.exports = class RouterUser {

    constructor(client, util, dashboard) {
        this.client = client;
        this.guilds = new Guilds(client, util, dashboard);

        dashboard.server.use('/guilds', this.guilds.server);
    }

};
