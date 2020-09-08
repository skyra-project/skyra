import { Time } from '@utils/constants';
import { Client, DMChannel, MessageEmbed, MessageReaction, NewsChannel, Permissions, TextChannel, User } from 'discord.js';
import { KlasaMessage, ReactionHandler, RichDisplay, RichDisplayRunOptions } from 'klasa';

export class UserRichDisplay extends RichDisplay {
	public constructor(embed?: MessageEmbed) {
		super(embed);
		this.useCustomFooters();
	}

	public async start(message: KlasaMessage, target: string = message.author.id, rawOptions: RichDisplayRunOptions = {}): Promise<ReactionHandler> {
		const options = {
			filter: (_: MessageReaction, user: User) => user.id === target,
			time: Time.Minute * 5,
			...rawOptions
		};
		if (target) {
			// Stop the previous display and cache the new one
			const display = UserRichDisplay.handlers.get(target);
			if (display) display.stop();
		}

		this.setAuthorizedFooter(message.client, message.channel);

		const handler = await super.run(message, options);
		const messageID = handler.message.id;

		handler.once('end', () => {
			UserRichDisplay.messages.delete(messageID);
			UserRichDisplay.handlers.delete(target);
		});

		UserRichDisplay.messages.set(messageID, handler);
		UserRichDisplay.handlers.set(target, handler);

		return handler;
	}

	private isDmChannel(channel: TextChannel | DMChannel | NewsChannel): channel is DMChannel {
		return channel.type === 'dm';
	}

	private setAuthorizedFooter(client: Client, channel: TextChannel | DMChannel | NewsChannel) {
		const priviledged = this.isDmChannel(channel) ? true : channel.permissionsFor(client.user!)?.has(UserRichDisplay.kPermissions) ?? false;

		if (priviledged) {
			for (let i = 1; i <= this.pages.length; i++)
				this.pages[i - 1].setFooter(`${this.footerPrefix}${i}/${this.pages.length}${this.footerSuffix}`);
			if (this.infoPage) this.infoPage.setFooter('ℹ');
		}
	}

	public static readonly messages = new Map<string, ReactionHandler>();
	public static readonly handlers = new Map<string, ReactionHandler>();

	private static readonly kPermissions = new Permissions([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES]).freeze();
}
