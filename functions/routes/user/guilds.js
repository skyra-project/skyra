const router = require('express').Router(); // eslint-disable-line new-cap
const moment = require('moment');

module.exports = class RouterGuilds {

    constructor(client, util, dashboard) {
        this.client = client;
        this.server = router;
        this.util = util;

        const getGuild = (req, res, callback) => {
            const guild = this.client.guilds.get(req.params.guild);
            if (!guild) return dashboard.sendError(req, res, 404, 'Guild Not found');
            if (!guild.available) return dashboard.sendError(req, res, 503, 'Guild Unavailable');

            return callback(guild);
        };

        const executeLevel = async (req, res, level, guild, callback) => {
            if (req.user.id === this.client.config.ownerID);
            else {
                const moderator = await guild.fetchMember(req.user.id).catch(() => null);
                if (!moderator || this.util.hasLevel(guild, moderator, level) !== true) return dashboard.sendError(req, res, 403, 'Access denied');
            }

            return callback();
        };

        /* Guild Related Endpoints */
        this.server.get('/:guild', this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                res.render(dashboard.getFile('guild.ejs'), dashboard.sendData(req, { moment, guild, settings: guild.settings }));
            }));
        });
        this.server.get('/:guild/manage', this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                res.render(dashboard.getFile('manage.ejs'), dashboard.sendData(req, { moment, guild, settings: guild.settings }));
            }));
        });
        this.server.get('/:guild/modlogs', this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                guild.settings.moderation.getCases()
                    .then(cases => res.render(dashboard.getFile('modlogs.ejs'), dashboard.sendData(req, { moment, modlogs: cases })))
                    .catch(err => dashboard.throwError(req, res, err));
            }));
        });

        /* Command Endpoints */
        this.server.post('/:guild/manage/leave', this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 4, guild, async () => {
                const message = req.body;
                if (message) {
                    const channel = guild.channels.get(guild.settings.channels.default || guild.defaultChannel.id);
                    if (channel.postable) await channel.send(message).catch(err => this.client.emit('log', err, 'error'));
                }
                guild.leave()
                    .then(() => this.util.sendMessage(res, `Successfully left ${guild.name} (${guild.id})`))
                    .catch(err => dashboard.throwError(req, res, err));
            }));
        });

        /* CIA Mode: ON */
        this.server.get('/:guild/:channel/messages', this.util.check.admin, (req, res) => {
            getGuild(req, res, (guild) => {
                const channel = guild.channels.get(req.params.channel);
                if (!channel) return dashboard.sendError(req, res, 404, 'Channel not found');
                return res.render(dashboard.getFile('messages.ejs'), dashboard.sendData(req, { guild, channel }));
            });
        });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('news')); // eslint-disable-line new-cap
        });
    }

};
