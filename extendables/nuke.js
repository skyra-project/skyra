exports.conf = {
    type: 'method',
    method: 'nuke',
    appliesTo: ['Message']
};

// eslint-disable-next-line func-names
exports.extend = function (time = 0) {
    if (this.timer) clearTimeout(this.timer);
    if (time === 0) return this.delete();
    const count = this.edits.length;
    this.timer = setTimeout(() => {
        const msg = this.channel.messages.get(this.id);
        if (msg && msg.edits.length === count) return this.delete();
        return null;
    }, time);
    return false;
};
