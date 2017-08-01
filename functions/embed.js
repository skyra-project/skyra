/* eslint-disable complexity */
module.exports = (embed) => {
    if (embed.constructor.name !== 'MessageEmbed') throw new Error('You must provide an embed object.');
    const output = {
        title: embed.title || null,
        description: embed.description || null,
        url: embed.url || null,
        color: embed.color || null,
        author: embed.author ? {
            name: embed.author.name || null,
            url: embed.author.url || null,
            icon_url: embed.author.iconURL || null
        } : null,
        provider: embed.provider ? {
            name: embed.provider.name,
            url: embed.provider.url
        } : null,
        image: embed.image ? {
            url: embed.image.url || null,
            height: embed.height,
            width: embed.width
        } : null,
        video: embed.video ? {
            url: embed.video.url || null,
            height: embed.video.height,
            width: embed.video.width
        } : null,
        thumbnail: embed.thumbnail ? {
            url: embed.thumbnail.url || null,
            height: embed.height,
            width: embed.width
        } : null,
        footer: embed.footer ? {
            text: embed.footer.text || null,
            icon_url: embed.footer.iconURL || null
        } : null,
        timestamp: embed.createdTimestamp ? new Date(embed.createdTimestamp) : null,
        fields: embed.fields ? embed.fields.map(field => ({
            name: field.name,
            value: field.value,
            inline: field.inline
        })) : null
    };

    return output;
};
