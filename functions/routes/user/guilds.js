const router = require('express').Router(); // eslint-disable-line new-cap
const moment = require('moment');

module.exports = class RouterGuilds {

    constructor(client, util, dashboard) {
        this.client = client;
        this.server = router;
        this.util = util;

        const executeLevel = async (req, res, level, guild, callback) => {
            if (req.user.id === this.client.config.ownerID);
            else {
                const moderator = await guild.fetchMember(req.user.id).catch(() => null);
                if (!moderator || this.util.hasLevel(guild, moderator, level) !== true) return dashboard.sendError(req, res, 403, 'Access denied');
            }

            return callback();
        };

        this.server.param('guild', async (req, res, next, id) => {
            const guild = this.client.guilds.get(id);
            if (!guild) return dashboard.sendError(req, res, 404, 'Guild Not found');
            if (!guild.available) return dashboard.sendError(req, res, 503, 'Guild Unavailable');

            req.guild = guild;

            let settings = guild.settings;
            if (settings instanceof Promise) settings = await settings;

            req.settings = settings;
            return next();
        });

        /* Guild Related Endpoints */
        this.server.get('/:guild', this.util.check.auth, (req, res) => {
            executeLevel(req, res, 3, req.guild, () => {
                res.render(dashboard.getFile('guild.ejs'), dashboard.sendData(req, { moment, guild: req.guild, settings: req.settings }));
            });
        });
        this.server.get('/:guild/manage', this.util.check.auth, (req, res) => {
            executeLevel(req, res, 3, req.guild, () => {
                res.render(dashboard.getFile('manage.ejs'), dashboard.sendData(req, { moment, guild: req.guild, settings: req.settings }));
            });
        });

        /* Command Endpoints */
        this.server.post('/:guild/manage/leave', this.util.check.auth, (req, res) => {
            executeLevel(req, res, 4, req.guild, async () => {
                const message = req.body;
                if (message) {
                    const channel = req.guild.channels.get(req.settings.channels.default);
                    if (channel.postable) await channel.send(message).catch(err => this.client.emit('log', err, 'error'));
                }
                req.guild.leave()
                    .then(() => this.util.sendMessage(res, `Successfully left ${req.guild.name} (${req.guild.id})`))
                    .catch(err => dashboard.throwError(req, res, err));
            });
        });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('news')); // eslint-disable-line new-cap
        });
    }

};
