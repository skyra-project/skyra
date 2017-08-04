exports.conf = {
    type: 'method',
    method: 'prompt',
    appliesTo: ['Message']
};

const awaitReaction = async (msg, message) => {
    await message.react('🇾');
    await message.react('🇳');
    const data = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
    if (data.firstKey() === '🇾') return null;
    throw null;
};

const awaitMessage = msg => new Promise(async (resolve, reject) => {
    try {
        const collector = msg.channel.createMessageCollector(mes => mes.author === msg.author, { time: 20000, max: 1 });
        collector.on('message', (mes) => {
            if (mes.content.toLowerCase() === 'yes') collector.stop('success');
            else collector.stop();
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'success') resolve();
            else reject();
        });
    } catch (err) {
        reject(err);
    }
});

// eslint-disable-next-line func-names
exports.extend = async function (content, options) {
    const message = await this.send(content, options);
    if (this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) await awaitReaction(this, message);
    else await awaitMessage(this);
    return true;
};
