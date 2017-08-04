const router = require('express').Router(); // eslint-disable-line new-cap

// Social
const managerSocialGlobal = require('../../../utils/managerSocialGlobal');
const managerSocialLocal = require('../../../utils/managerSocialLocal');

module.exports = class RouterLeaderboard {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;

        /* Global */
        this.server.get('/global', this.util.check.admin, (req, res) => {
            this.util.sendMessage(res, this.serializeList(managerSocialGlobal.fetchAll(), 'global'));
        });
        this.server.get('/global/:user', this.util.gateway.auth, async (req, res) => {
            const user = await this.client.fetchUser(req.params.user).then(us => us.profile).catch(() => managerSocialGlobal.get(req.params.user));
            if (!user) return this.util.throw(res, ...this.util.error.USER_NOT_FOUND);

            return this.util.sendMessage(res, this.serialize.global(user));
        });

        /* Local */
        const memberExists = async (req, res, callback) => {
            this.util.getGuild(req, res, async (guild) => {
                const member = await guild.fetchMember(req.params.member).then(mem => mem.points).catch(() => managerSocialLocal.fetch(guild.id, req.params.member));
                if (!member) return this.util.throw(res, ...this.util.error.USER_NOT_FOUND);

                return callback(guild, member);
            });
        };

        this.server.get('/local/:guild', this.util.gateway.auth, (req, res) => {
            const guild = managerSocialLocal.fetchAll().get(req.params.guild);
            if (!guild) return this.util.throw(res, ...this.util.error.GUILD_NOT_FOUND);

            return this.util.sendMessage(res, this.serializeList(guild, 'local'));
        });

        this.server.get('/local/:guild/:member', this.util.gateway.auth, (req, res) => {
            memberExists(req, res, (guild, member) => this.util.sendMessage(res, this.serialize.local(member)));
        });

        this.server.post('/local/:guild/:member', this.util.gateway.auth, async (req, res) => {
            memberExists(req, res, (guild, member) => this.util.executeLevel(req, res, 2, guild, () => {
                const data = parseInt(req.body.payload);
                if (typeof data === 'undefined' || isNaN(data)) return this.util.throw(res, ...this.util.error.INVALID_ARGUMENT('payload', 'Integer')); // eslint-disable-line new-cap

                return member.update(data)
                    .then(() => this.util.sendMessage(res, `Successfully changed the value 'points' for ${req.params.member} to: ${data}`))
                    .catch(err => this.util.sendError(res, err));
            }));
        });

        this.server.delete('/local/:guild/:member', this.util.gateway.auth, async (req, res) => {
            memberExists(req, res, (guild, member) => this.util.executeLevel(req, res, 2, guild, () => member.destroy()
                .then(() => this.util.sendMessage(res, `Successfully destroyed the data for ${req.params.member}`))
                .catch(err => this.util.sendError(res, err))));
        });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('leaderboards')); // eslint-disable-line new-cap
        });
    }

    serializeList(map, type) {
        const serializer = this.serialize[type];
        const output = [];
        for (const item of map.values()) output.push(serializer(item));
        return output;
    }

    get serialize() { // eslint-disable-line class-methods-use-this
        return {
            global: user => ({
                id: user.id,
                points: user.points,
                money: user.money,
                color: user.color,
                banner: user.banners,
                bannerList: user.bannerList,
                times: {
                    daily: user.timeDaily,
                    rep: user.timerep
                },
                playlist: user.playlist
            }),
            local: user => ({
                id: user.id,
                score: user.score
            })
        };
    }

};
