const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['r'],
            permLevel: 10,
            description: "Reloads the klasa piece, if it's been updated or modified.",
            usage: '<inhibitors|finalizers|monitors|languages|providers|events|commands|extendables|Piece:piece>'
        });
    }

    async run(msg, [piece]) {
        if (typeof piece === 'string') return this.client[piece].loadAll().then(() => msg.send(msg.language.get('COMMAND_RELOAD_ALL', piece)));
        return piece.reload()
            .then(itm => msg.send(msg.language.get('COMMAND_RELOAD', itm.type, itm.name)))
            .catch(err => {
                this.client[`${piece.type}s`].set(piece);
                msg.error(err);
            });
    }

};
