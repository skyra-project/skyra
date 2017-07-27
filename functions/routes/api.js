const router = require("express").Router();

const Guilds = require("./api/guilds");
const Leaderboards = require("./api/leaderboards");
const News = require("./api/news");

module.exports = class RouterAPI {

    constructor(client, util) {
        this.client = client;
        this.server = router;

        this.util = util;

        this.server.use("/guilds", new Guilds(client, this.util).server);
        this.server.use("/leaderboards", new Leaderboards(client, this.util).server);
        this.server.use("/news", new News(client, this.util).server);

        this.server.get("*", (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT("api"));
        });
    }

};
