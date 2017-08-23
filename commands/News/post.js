/* Core Pieces */
const provider = require('../../providers/json');
const { Command } = require('../../index');

/* Dependencies */
const snekfetch = require('snekfetch');
const marked = require('marked');
const url = require('url');

const fetchTW = twit => snekfetch.get(`https://publish.twitter.com/oembed?url=${encodeURIComponent(twit)}`)
    .then(data => JSON.parse(data.text).html);

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permLevel: 10,
            mode: 1,
            spam: true,
            cooldown: 180,

            usage: '<post:string>',
            description: 'Post some news.'
        });
    }

    async run(msg, [title]) {
        if (await provider.has('news', title)) throw 'this page already exists.';
        const text = await this.prompt(msg);
        const parsedURLs = await this.parseURLs(text);
        const html = marked(parsedURLs).replace(/\n$/, '').replace(/\n+/g, '<br />');
        await provider.create('news', this.parseTitle(title), { title, html, author: msg.author.id, date: Date.now() });
        return msg.send(`Successfully created the page ${title}`);
    }

    async prompt(msg) {
        const prompt = data => msg.channel.awaitMessages(mes => mes.author.id === msg.author.id, { max: 1, time: 30000, errors: ['time'] })
            .then(async (collected) => {
                if (collected.first().content === 'stop') return data.join(' ');
                data.push(collected.first().content);
                await msg.channel.send(`[MultiMessage] Part: ${data.length}, received. Type \`stop\` to stop the MultiMessage prompt.`).catch(Command.handleError);
                return prompt(data);
            })
            .catch(() => {
                throw 'prompt cancelled: I did not receive a message within 30 seconds.';
            });
        return prompt([]);
    }

    parseURLs(raw) {
        return this.parseTwitter(raw).then(text => text
            .replace(/ /g, '&nbsp;')
            .replace(/<@!?[0-9]+>/g, (input) => {
                const id = input.replace(/<|!|>|@/g, '');
                if (this.channel.type === 'dm' || this.channel.type === 'group') {
                    return this.client.users.has(id) ? `@${this.client.users.get(id).username}` : input;
                }
                const user = this.client.users.get(id);
                if (user) return `@${user.username}`;
                return input;
            })
            .replace(/<#[0-9]+>/g, (input) => {
                const channel = this.client.channels.get(input.replace(/<|#|>/g, ''));
                if (channel) return `#${channel.name}`;
                return input;
            })
            .replace(/<@&[0-9]+>/g, (input) => {
                if (this.channel.type === 'dm' || this.channel.type === 'group') return input;
                const role = this.guild.roles.get(input.replace(/<|@|>|&/g, ''));
                if (role) return `@${role.name}`;
                return input;
            })
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9-_]{11}[^ ]*/g, (match) => {
                const id = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]{11})/.exec(match)[1];
                return `<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe></div>`;
            })
            .replace(/https:\/\/\S+\/(\S+(?:png|jpg|jpeg|webm|gif))/g, (match) => {
                const res = url.parse(match);
                if (res.protocol && res.hostname) return `<img src="${match}" class="img-responsive img-rounded"></img>`;
                return match;
            })
            .replace(/\n={3,}\n/g, '<hr></hr>')
            .replace(/\n+/g, '\n'));
    }

    async parseTwitter(text) {
        const urls = [];
        let i = 0;
        let pending = text.replace(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com\/\w+\/status\/)\d+/g, (match) => {
            const index = `twitter:${i}`;
            urls[i] = fetchTW(match).then((html) => { pending = pending.replace(index, html); });
            i++;
            return index;
        });
        if (urls.length === 0) return pending;
        return Promise.all(urls).then(() => pending);
    }

    parseTitle(title) {
        return encodeURIComponent(title).replace(/\(/g, '%28').replace(/\)/g, '%29');
    }

    init() {
        return provider.hasTable('news').then(bool => bool ? true : provider.createTable('news'));
    }

};
