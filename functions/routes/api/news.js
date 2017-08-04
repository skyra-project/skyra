const router = require('express').Router(); // eslint-disable-line new-cap
const provider = require('../../../providers/json');

module.exports = class RouterGuild {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;

        this.server.get('/', (req, res) => {
            provider.getAll('news')
                .then(data => this.util.sendMessage(res, data))
                .catch(err => this.util.sendError(res, err));
        });
        this.server.get('/:new', (req, res) => {
            provider.get('news', req.params.new)
                .then(data => data ? this.util.sendMessage(res, data) : this.util.throw(res, ...this.util.error.UNKNOWN_NEWS(req.params.new))) // eslint-disable-line new-cap
                .catch(err => this.util.sendError(res, err));
        });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('news')); // eslint-disable-line new-cap
        });
    }

};
