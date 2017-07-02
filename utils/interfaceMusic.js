const ytdl = require("ytdl-core");
const manager = require("./managerMusic");

module.exports = class InterfaceMusic {
    constructor(guild) {
        Object.defineProperty(this, "client", { value: guild.client });
        this.guild = guild;
        this.queue = [];
        this.playing = false;
        this.channel = null;
        this.voiceChannel = null;

        this.dispatcher = null;
        this.connection = null;

        this.autoplay = false;
        this.next = null;
    }

    async join(voiceChannel) {
        this.voiceChannel = voiceChannel;
        await this.voiceChannel.join().then((connection) => { this.connection = connection; });
        return this;
    }

    async leave() {
        if (!this.voiceChannel) throw "NO_VOICECHANNEL";
        await this.voiceChannel.leave();
        this.voiceChannel = null;
        this.dispatcher = null;
        this.connection = null;
        this.playing = false;
        return this;
    }

    async play() {
        if (!this.voiceChannel) throw "NO_VOICECHANNEL";
        else if (!this.connection) throw "NO_CONNECTION";
        else if (!this.queue[0]) throw "NO_SONG";
        else if (this.playing === true) throw "ALREADY_PLAYING";

        const stream = ytdl(this.queue[0].url, { audioonly: true })
            .on("error", err => this.client.emit("log", err, "error"));

        if (this.playing === false) this.playing = true;

        this.dispatcher = this.connection.playStream(stream, { passes: 5 });
        return this.dispatcher;
    }

    pause() {
        this.dispatcher.pause();
        return this;
    }

    resume() {
        this.dispatcher.resume();
        return this;
    }

    skip(force = false) {
        if (force) this.dispatcher.end();
        this.queue.shift();
        return this;
    }

    prune() {
        this.queue = [];
        return this;
    }

    async destroy() {
        if (this.voiceChannel) await this.voiceChannel.leave();
        manager.delete(this.guild.id);
        this.queue = [];
        this.playing = false;
        this.voiceChannel = null;
        this.dispatcher = null;
        this.connection = null;
        return null;
    }
};
