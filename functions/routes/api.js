const router = require("express").Router();

const Guilds = require("./guilds");
const Leaderboards = require("./leaderboards");
const News = require("./news");

const Util = require("./util");

module.exports = class RouterAPI {

    constructor(client) {
        this.client = client;
        this.server = router;

        this.util = new Util(client);

        this.server.use("/guilds", new Guilds(client, this.util).server);
        this.server.use("/leaderboards", new Leaderboards(client, this.util).server);
        this.server.use("/news", new News(client, this.util).server);

        this.server.get("*", (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT("api"));
        });
    }

};
