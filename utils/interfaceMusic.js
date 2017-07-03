const ytdl = require("ytdl-core");
const manager = require("./managerMusic");

module.exports = class InterfaceMusic {
    constructor(guild) {
        Object.defineProperty(this, "client", { value: guild.client });
        this.guild = guild;
        this.queue = [];
        this.channel = null;

        this.dispatcher = null;

        this.autoplay = false;
        this.next = null;

        this.status = "idle";
    }

    join(voiceChannel) {
        return voiceChannel.join()
            .catch((err) => {
                if (String(err).includes("ECONNRESET")) throw "There was an issue connecting to the voice channel.";
                this.client.emit("log", err, "error");
                throw err;
            });
    }

    async leave() {
        if (!this.voiceChannel) throw "I am not in a voice channel.";
        if (this.voiceChannel) this.voiceChannel.leave();
        this.dispatcher = null;
        this.status = "idle";
        return this;
    }

    async play() {
        if (!this.voiceChannel) throw "I am not in a voice channel.";
        else if (!this.connection) throw "I could not find a connection.";
        else if (!this.queue[0]) throw "The queue is empty.";

        const stream = ytdl(this.queue[0].url, { audioonly: true })
            .on("error", err => this.client.emit("log", err, "error"));

        this.dispatcher = this.connection.playStream(stream, { passes: 5 });
        return this.dispatcher;
    }

    pause() {
        this.dispatcher.pause();
        this.status = "paused";
        return this;
    }

    resume() {
        this.dispatcher.resume();
        this.status = "playing";
        return this;
    }

    skip(force = false) {
        if (force) this.dispatcher.end();
        else this.queue.shift();
        return this;
    }

    prune() {
        this.queue = [];
        return this;
    }

    async destroy() {
        if (this.voiceChannel) this.voiceChannel.leave();
        manager.delete(this.guild.id);
        return null;
    }

    get voiceChannel() {
        return this.guild.me.voiceChannel;
    }

    get connection() {
        return this.voiceChannel ? this.voiceChannel.connection : null;
    }
};
