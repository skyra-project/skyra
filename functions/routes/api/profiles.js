const router = require('express').Router(); // eslint-disable-line new-cap

module.exports = class RouterLeaderboard {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;

        const auth = (req, res, next) => {
            if (!req.query.auth) return this.util.throw(res, ...this.util.error.AUTH_REQUIRED);
            if (req.query.auth !== this.client.config.dash.privateAuth) return this.util.throw(res, ...this.util.error.AUTH_FAILED);
            return next();
        };

        this.server.get('/:user', auth, async (req, res) => {
            const user = await this.client.users.fetch(req.params.user)
                .then(us => us.profile)
                .catch(() => null);

            if (user === null) return this.util.throw(res, ...this.util.error.USER_NOT_FOUND);

            return this.util.sendMessage(res, this.serialize(user));
        });
        this.server.put('/:user', auth, async (req, res) => {
            if (!req.body.value || isNaN(req.body.value))
                return this.util.throw(res, ...this.util.error.PARSE_ERROR('value must be a number'));
            if (req.body.action && ['add', 'remove', 'set'].includes(req.body.action) === false)
                return this.util.throw(res, ...this.util.error.PARSE_ERROR('action must be either \'add\', \'remove\' or \'set\''));

            const object = req.body;
            const type = object.type === 'money' ? 'money' : 'points';
            const action = typeof object.action !== 'undefined' ? object.action : 'add';
            const amount = typeof object.value === 'number' ? object.value : parseInt(object.value);
            const reason = typeof object.reason === 'string' ? object.reason : null;

            const user = await this.client.users.fetch(req.params.user)
                .then(us => us.profile)
                .catch(() => null);

            if (user === null) return this.util.throw(res, ...this.util.error.USER_NOT_FOUND);
            const oldAmount = user[type];
            let newAmount = user[type];

            if (action === 'set')
                newAmount = amount;
            else if (action === 'add')
                newAmount += amount;
            else {
                if (newAmount < amount)
                    return res.status(403).send({
                        success: false,
                        message: 'Failed to remove points from user. \'value\' is greater than \'current\'',
                        data: {
                            current: newAmount,
                            tried: amount,
                            action: type
                        },
                        type: 'PROFILE_REMOVE_VALUE'
                    });
                newAmount -= amount;
            }

            const newObject = {};
            newObject[type] = newAmount;
            await user.update(newObject);

            this.client.emit('log', `PUT /api/profiles/${user.id} | New value for ${type}: ${oldAmount} | ${newAmount}.`, 'info');
            this.client.redis.setJson(`RDN_history_${Date.now().toString()}`, { user: user.id, old: oldAmount, new: newAmount, reason }, 172800000)
                .catch(error => this.client.emit('log', error, 'error'));
            return this.util.sendMessage(res, newAmount);
        });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('profiles'));
        });
    }

    serialize(user) { // eslint-disable-line class-methods-use-this
        return {
            id: user.id,
            points: user.points,
            money: user.money,
            color: user.color,
            banner: user.banners,
            bannerList: user.bannerList,
            times: {
                daily: user.timeDaily,
                rep: user.timerep
            }
        };
    }

};
