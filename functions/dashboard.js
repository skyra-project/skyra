const toTitleCase = require('../functions/toTitleCase');
const provider = require('../providers/json');
const { resolve } = require('path');
const { Collection } = require('discord.js');
const express = require('express');
const DashboardUser = require('./dashboardUser');
const availableBanners = require('../assets/banners.json');

// Express Plugins
const passport = require('passport');
const session = require('express-session');
const { Strategy } = require('passport-discord');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { renderFile } = require('ejs');

const API = require('./routes/api');
const Util = require('./routes/util');

const UserRoute = require('./routes/user');

module.exports = class Dashboard {

    constructor(client) {
        this.client = client;
        this.users = new Collection();
        this.owner = client.config.ownerID;
        this.routes = resolve(client.baseDir, 'views');
        this.server = express();
        this.server.use(helmet.noCache());
        this.server.use(session({
            secret: 'SkyraProjectTM',
            resave: false,
            saveUninitialized: false
        }));
        this.server.use('/css', express.static(resolve(this.routes, 'blocks', 'css')));
        this.server.use('/img', express.static(resolve(this.routes, 'blocks', 'img')));
        this.server.use('/js', express.static(resolve(this.routes, 'blocks', 'js')));
        this.server.use('/vendor', express.static(resolve(this.routes, 'blocks', 'vendor')));
        this.server.use(passport.initialize());
        this.server.use(passport.session());
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use('html', renderFile);

        this.supportGuild = 'https://discordapp.com/invite/6gakFR2';

        this.util = new Util(client);
        this.userRoute = new UserRoute(client, this.util, this);

        this.api = new API(client, this.util);
        this.server.use('/api', this.api.server);

        passport.serializeUser((id, done) => {
            done(null, id);
        });
        passport.deserializeUser((id, done) => {
            done(null, this.users.get(id));
        });
        passport.use(new Strategy({
            clientID: client.user.id,
            clientSecret: client.config.dash.oauthSecret,
            callbackURL: client.config.dash.callback,
            scope: ['identify', 'guilds']
        }, (accessToken, refreshToken, profile, done) => {
            this.users.set(profile.id, new DashboardUser(this.client, profile));
            process.nextTick(() => done(null, profile.id));
        }));

        this.throwError = (req, res, err) => {
            this.client.emit('log', err, 'error');
            return this.sendError(req, res, 500, err);
        };

        /* Offline Endpoints */
        this.server.get('/', (req, res) => {
            res.render(this.getFile('index.ejs'), this.sendData(req, { banners: this.banners }));
        });
        this.server.get('/commands', (req, res) => {
            res.render(this.getFile('commands.ejs'), this.sendData(req, { commands: this.commands }));
        });
        this.server.get('/statistics', (req, res) => {
            res.render(this.getFile('statistics.ejs'), this.sendData(req, { usage: this.client.usage }));
        });
        this.server.get('/invite', (req, res) => {
            res.redirect(client.invite);
        });
        this.server.get('/join', (req, res) => {
            res.redirect(this.supportGuild);
        });

        /* JSON Endpoints */
        this.server.get('/statistics/json', (req, res) => {
            res.json(this.client.usage);
        });

        /* Discord Endpoints */
        this.server.get('/login', passport.authenticate('discord'));
        this.server.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
            if (req.session.backURL) {
                res.redirect(req.session.backURL);
                req.session.backURL = null;
            } else {
                res.redirect('/');
            }
        });
        this.server.get('/logout', (req, res) => {
            req.logout();
            res.redirect('/');
        });

        /* Dashboard Related Endpoints */
        this.server.get('/dashboard', this.util.check.auth, (req, res) => {
            res.render(this.getFile('dashboard.ejs'), this.sendData(req, { page: 'Dashboard', guilds: req.user.managableGuilds }));
        });
        this.server.get('/admin', this.util.check.admin, (req, res) => {
            res.render(this.getFile('dashboard.ejs'), this.sendData(req, { page: 'Admin', guilds: this.dClient.guilds }));
        });

        /* User Related Endpoints */
        this.server.get('/me', this.util.check.auth, (req, res) => {
            res.redirect(`/users/${req.user.id}`);
        });
        this.server.get('/users/:id', this.util.check.auth, (req, res) => {
            client.fetchUser(req.params.id)
                .then(user => res.render(this.getFile('profile.ejs'), this.sendData(req, { profile: user.profile })))
                .catch(() => this.sendError(req, res, 404, 'Not found'));
        });

        /* News */
        this.server.get('/news', (req, res) => {
            provider.getAll('news')
                .then(news => res.render(this.getFile('newslist.ejs'), this.sendData(req, { news })))
                .catch(err => this.throwError(req, res, err));
        });
        this.server.get('/news/:id', (req, res) => {
            provider.get('news', req.param.id)
                .then((news) => {
                    if (!news) this.sendError(req, res, 404, 'Announcement not found');
                    else res.render(this.getFile('new.ejs'), this.sendData(req, { news }));
                })
                .catch(err => this.throwError(req, res, err));
        });

        this.server.get('/404', (req, res) => this.sendError(req, res, 404, 'Not found'));
        this.server.get('*', (req, res) => this.sendError(req, res, 404, `Path not found: ${req.path}`));
        this.server.use((err, req, res) => this.throwError(req, res, err));

        this.site = this.server.listen(this.client.config.dash.port);
    }

    get dClient() {
        return {
            owner: this.client.config.ownerID,
            guilds: this.client.guilds,
            invite: this.client.invite,
            avatar: this.client.user.avatarURL()
        };
    }

    getUser(req) { // eslint-disable-line class-methods-use-this
        return req.isAuthenticated() === false ?
            { id: null, username: null, avatar: null, auth: false } :
            Object.assign({ auth: true }, req.user);
    }

    getFile(file) {
        return resolve(this.routes, file);
    }

    sendData(req, obj) {
        return Object.assign({ Client: this.dClient, user: this.getUser(req) }, obj);
    }

    sendError(req, res, code, error) {
        return res.status(code).render(this.getFile('error.ejs'), this.sendData(req, { code, error }));
    }

    init() {
        return Promise.all([this.initBanners(), this.initCommands()]);
    }

    initCommands() {
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;'
        };

        const escapeHTML = text => String(text).replace(/[&<>"'`/]/g, str => entityMap[str]);
        const buildHTML = text => text.replace(/\\n/g, '<br />');
        const levelHTML = (level) => {
            switch (level) {
                case 0: return `<span style="float:right;" class="label label-default">${level}</span>`;
                case 1:
                case 2:
                case 3:
                case 4: return `<span style="float:right;" class="label label-warning">${level}</span>`;
                default: return `<span style="float:right;" class="label label-danger">${level}</span>`;
            }
        };

        const createTables = (html) => {
            let isTable = false;
            let isSpace = false;
            const output = [];

            const toggleSpace = () => {
                if (isSpace === false) output.push('<br />');
                isSpace = !isSpace;
            };
            const toggleTable = () => {
                output.push(isTable ? '</tbody></table>' : '<table  class="table table-hover"><tbody>');
                isTable = !isTable;
            };

            for (const line of html.split('\n')) {
                if (line === '') {
                    if (isTable === true) toggleTable();
                    else if (isSpace === true) toggleSpace();
                } else if (/= \w+ =/.test(line)) {
                    if (isSpace === false) toggleSpace();
                    output.push(`<h5 class="text-left">${line.replace(/=/g, '').trim()}</h5>`);
                } else if (/ :: /.test(line)) {
                    if (isTable === false) toggleTable();
                    const [pairOne, pairTwo] = line.split('::');
                    output.push(`<tr><th>${pairOne.trim()}</th><th>${pairTwo.trim()}</th></tr>`);
                } else {
                    if (isTable === true) toggleTable();
                    else if (isSpace === true) toggleSpace();
                    if (/^\s*❯❯/.test(line)) output.push(`<blockquote><p>${line.replace(/^\s*❯❯/, '')}</p></blockquote>`);
                    else output.push(`<p>${line}</p>`);
                }
            }
            return output.join('');
        };

        this.commands = new Collection();
        for (const command of this.client.commands.values()) {
            if (command.conf.permLevel === 10) continue;
            const cat = command.help.category;
            if (!this.commands.has(cat)) this.commands.set(cat, []);
            const description = `<h5 class="text-left">Description</h5><p>${escapeHTML(command.help.description)}</p><br />`;
            const html = description + (command.help.extendedHelp ? createTables(buildHTML(escapeHTML(command.help.extendedHelp))) : 'Not set');
            this.commands.get(cat).push({
                level: levelHTML(command.conf.permLevel),
                guildOnly: !command.conf.runIn.includes('dm'),
                name: toTitleCase(command.help.name),
                description: command.help.description,
                html
            });
        }
    }

    async initBanners() {
        const users = [];
        for (const banner of Object.values(availableBanners)) {
            if (users.includes(banner.author)) continue;
            users.push(banner.author);
        }
        await Promise.all(users.map(user => this.client.fetchUser(user)));
        this.banners = [];
        for (const banner of Object.values(availableBanners)) {
            this.banners.push(Object.assign(banner, { resAuthor: this.client.users.get(banner.author).tag }));
        }
        return true;
    }

};
