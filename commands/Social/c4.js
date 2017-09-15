const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['connect4', 'connect-four'],
            botPerms: ['MANAGE_MESSAGES'],
            guildOnly: true,
            mode: 1,
            spam: true,

            usage: '<user:advuser>',
            description: '(BETA) Play Connect-Four with your friends.'
        });

        this._prompt = (message, user) => message.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(message.content);
        this._options = { time: 30000, errors: ['time'], max: 1 };
        this._assets = {
            emoji: {
                1: '<:PlayerONE:352403997300359169>',
                2: '<:PlayerTWO:352404081974968330>',
                0: '<:Empty:352403997606412289>',
                win1: '<:PlayerONEWin:352403997761601547>',
                win2: '<:PlayerTWOWin:352403997958602752>'
            },
            native: {
                1: '🔵',
                2: '🔴',
                0: '⚫',
                win1: '⚪',
                win2: '⚪'
            }
        };
        this._emojis = '1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣'.split(' ');

        this.games = new Set();
    }

    async run(msg, [user], settings, i18n) {
        if (user.id === this.client.user.id) throw i18n.get('COMMAND_C4_SKYRA');
        if (user.bot) throw i18n.get('COMMAND_C4_BOT');
        if (this.games.has(msg.channel.id)) throw i18n.get('COMMAND_C4_PROGRESS');

        const mes = await msg.send(i18n.get('COMMAND_C4_PROMPT', msg.author, user));
        const response = await msg.channel.awaitMessages(message => this._prompt(message, user), this._options)
            .catch(() => { throw i18n.get('COMMAND_C4_PROMPT_TIMEOUT'); });

        if (/ye(s|ah?)?/i.test(response.first().content) === false)
            throw i18n.get('COMMAND_C4_PROMPT_DENY');

        this.games.add(msg.channel.id);
        await mes.nuke();

        const assets = this._assets[msg.channel.permissionsFor(msg.guild.me).has('USE_EXTERNAL_EMOJIS') ? 'emoji' : 'native'];
        const game = this.createGame([msg.author, user]);
        const player = Math.round(Math.random());

        const message = await this.createMessage(msg, i18n);

        await this.edit(message, i18n.get('COMMAND_C4_START', player === 0 ? msg.author.tag : user.tag, this.displayTable(game.table, assets)));

        return this.awaitGame(message, game, player, assets, i18n).catch((err) => {
            this.client.emit('log', err, 'error');
            return this.conclude(message, i18n.get('SYSTEM_ERROR'));
        });
    }

    async createMessage(msg, i18n) {
        const message = await msg.channel.send(i18n.get('SYSTEM_LOADING'));
        for (const emoji of this._emojis) await message.react(emoji);

        return message;
    }

    async conclude(message, content) {
        this.games.delete(message.channel.id);

        await message.clearReactions().catch(error => {
            if (error.code !== 10008) throw error;
            return null;
        });

        return this.edit(message, content);
    }

    async awaitGame(message, game, player, assets, i18n) {
        const playerUser = game.players[player];

        const line = await this.collect(message, playerUser.id).catch((err) => {
            if (err === 'TIMEOUT')
                return this.conclude(message, i18n.get('COMMAND_C4_GAME_TIMEOUT'))
                    .then(() => null);

            if (err === 'BAD_REACTION')
                return this.awaitGame(message, game, player, assets, i18n)
                    .then(() => null);

            throw err;
        });

        if (!line) return null;

        if (this._emojis.includes(line.key) === false)
            return this.awaitGame(message, game, player, assets);

        const row = this._emojis.indexOf(line.key);
        if (game.full[row]) {
            await message.channel.send(i18n.get('COMMAND_C4_GAME_COLUMN_FULL'))
                .then(mes => mes.nuke(5000).catch(() => null));

            return this.awaitGame(message, game, player, assets);
        }

        const result = this.pushLine(game, row, player);
        if (result !== false) {
            this.showWinner(game.table, result, player + 1);
            const winner = await this.client.fetchUser(game.players[player]);
            return this.conclude(message, i18n.get('COMMAND_C4_GAME_WIN', winner.username, this.displayTable(game.table, assets)));
        }

        if (this.checkDraw(game) === true)
            return this.conclude(message, i18n.get('COMMAND_C4_GAME_DRAW', this.displayTable(game.table, assets)));

        player = this.switchPlayer(player);

        await line.reaction.remove(playerUser.id);
        await this.edit(message, i18n.get('COMMAND_C4_GAME_NEXT', game.players[player].tag), this.displayTable(game.table, assets));
        return this.awaitGame(message, game, player, assets);
    }

    showWinner(table, row, player) {
        for (let i = 0; i < row.length; i++)
            table[row[i][0]][row[i][1]] = `win${player}`;
    }

    collect(message, player) {
        return new Promise((resolve, reject) => {
            message.createReactionCollector((reaction, user) => user.id === player, { time: 60000, errors: ['time'], max: 1 })
                .on('end', reactions => {
                    const key = reactions.firstKey();
                    if (!key) reject('TIMEOUT');
                    if (this._emojis.includes(key) === false) reject('BAD_REACTION');
                    return resolve({ key, reaction: reactions.first() });
                });
        });
    }

    switchPlayer(player) {
        return player === 0 ? 1 : 0;
    }

    pushLine(game, line, player) {
        const row = game.table[line];

        for (let y = 4; y >= 0; y--) {
            if (row[y] > 0) continue;
            if (y === 0) game.full[line] = true;

            game.table[line][y] = player + 1;
            return this.checkWin(game.table, line, y, player + 1);
        }

        return false;
    }

    createGame(players) {
        return {
            table: [
                new Array(5).fill(0),
                new Array(5).fill(0),
                new Array(5).fill(0),
                new Array(5).fill(0),
                new Array(5).fill(0),
                new Array(5).fill(0),
                new Array(5).fill(0)
            ],
            full: new Array(7).fill(false),
            players
        };
    }

    displayTable(table, assets) {
        let output = '';
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < table.length; x++) output += `${assets[table[x][y]]}\t   `;
            output += '\n';
        }

        return output;
    }

    checkWin(table, x, y, player) {
        const verticals = [];

        for (let i = Math.max(0, y - 3); i <= Math.min(4, y + 3); i++) verticals.push({ value: table[x][i], coords: [x, i] });

        const verticalWins = this.checkRow(verticals, player);
        if (verticalWins !== false) return verticalWins;

        const min = x - 3;
        const max = x + 3;

        let duy = y + 3;
        let ddy = y - 3;

        const horizontal = [];
        const diagonalup = [];
        const diagonaldw = [];

        for (let i = min; i <= max; i++) {
            if (i < 0) {
                duy--;
                ddy++;
                continue;
            }
            if (i >= 7) break;

            horizontal.push({ value: table[i][y], coords: [i, y] });

            if (duy >= 0 && duy < 5) diagonalup.push({ value: table[i][duy], coords: [i, duy] });
            if (ddy >= 0 && ddy < 5) diagonaldw.push({ value: table[i][ddy], coords: [i, ddy] });

            duy--;
            ddy++;
        }

        return this.checkRow(horizontal, player)
            || this.checkRow(diagonalup, player)
            || this.checkRow(diagonaldw, player);
    }

    checkDraw(game) {
        for (let i = 0; i < game.full.length; i++)
            if (game.full[i] === false) return false;

        return true;
    }

    checkRow(array, player) {
        let repeated = 0;
        for (let i = 0; i < array.length; i++) {
            if (array[i].value !== player) {
                repeated = 0;
                continue;
            }
            repeated++;
            if (repeated === 4) return [array[i - 3].coords, array[i - 2].coords, array[i - 1].coords, array[i].coords];
        }
        return false;
    }

    edit(message, content) {
        return this.client.api.channels[message.channel.id].messages[message.id].patch({ data: { content } })
            .catch((error) => {
                if (error.code !== 10008) throw error;
                return message.channel.send(content).then(mes => { message.id = mes.id; });
            });
    }

};
