import { LanguageKeys } from '#lib/i18n/languageKeys';
import { minutes } from '#utils/common';
import {
	isAnyInteraction,
	isMessageButtonInteraction,
	isMessageInstance,
	PaginatedMessagePage,
	type PaginatedMessageAction,
	type PaginatedMessageOptions
} from '@sapphire/discord.js-utilities';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isFunction } from '@sapphire/utilities';
import {
	Constants,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	type ButtonInteraction,
	type CommandInteraction,
	type Message,
	type MessageOptions,
	type SelectMenuInteraction,
	type User,
	type WebhookEditMessageOptions
} from 'discord.js';
import { SkyraPaginatedMessage } from './SkyraPaginatedMessage';

export class HelpPaginatedMessage extends SkyraPaginatedMessage {
	private language: TFunction;

	public constructor(language: TFunction, options: PaginatedMessageOptions = {}) {
		super(options);
		this.setIdle(minutes(10));
		this.language = language;

		this.setActions([
			{
				customId: '@sapphire/paginated-messages.goToPage',
				type: Constants.MessageComponentTypes.SELECT_MENU,
				selectMenuIndex: 'set-1',
				run: ({ handler, interaction }) => interaction.isSelectMenu() && (handler.index = parseInt(interaction.values[0], 10))
			},
			{
				customId: '@sapphire/paginated-messages.goToPage-2',
				type: Constants.MessageComponentTypes.SELECT_MENU,
				selectMenuIndex: 'set-2',
				run: ({ handler, interaction }) => interaction.isSelectMenu() && (handler.index = parseInt(interaction.values[0], 10))
			},
			{
				customId: '@sapphire/paginated-messages.firstPage',
				style: 'PRIMARY',
				emoji: '⏪',
				type: Constants.MessageComponentTypes.BUTTON,
				run: ({ handler }) => (handler.index = 0)
			},
			{
				customId: '@sapphire/paginated-messages.previousPage',
				style: 'PRIMARY',
				emoji: '◀️',
				type: Constants.MessageComponentTypes.BUTTON,
				run: ({ handler }) => {
					if (handler.index === 0) {
						handler.index = handler.pages.length - 1;
					} else {
						--handler.index;
					}
				}
			},
			{
				customId: '@sapphire/paginated-messages.nextPage',
				style: 'PRIMARY',
				emoji: '▶️',
				type: Constants.MessageComponentTypes.BUTTON,
				run: ({ handler }) => {
					if (handler.index === handler.pages.length - 1) {
						handler.index = 0;
					} else {
						++handler.index;
					}
				}
			},
			{
				customId: '@sapphire/paginated-messages.goToLastPage',
				style: 'PRIMARY',
				emoji: '⏩',
				type: Constants.MessageComponentTypes.BUTTON,
				run: ({ handler }) => (handler.index = handler.pages.length - 1)
			},
			{
				customId: '@sapphire/paginated-messages.stop',
				style: 'DANGER',
				emoji: '⏹️',
				type: Constants.MessageComponentTypes.BUTTON,
				run: ({ collector }) => {
					collector.stop();
				}
			}
		]);
	}

	public override setActions(actions: HelpPaginatedMessageAction[]): this {
		this.actions.clear();
		return this.addActions(actions);
	}

	public override addPage(page: PaginatedMessagePage): this {
		this.pages.push(page);

		return this;
	}

	/**
	 * Sets up the message.
	 *
	 * @param messageOrInteraction The message or interaction that triggered this {@link PaginatedMessage}.
	 * Generally this will be the command message or an interaction
	 * (either a {@link CommandInteraction}, a {@link SelectMenuInteraction} or a {@link ButtonInteraction}),
	 * but it can also be another message from your client, i.e. to indicate a loading state.
	 *
	 * @param author The author the handler is for.
	 */
	protected async setUpMessage(
		messageOrInteraction: Message | CommandInteraction | SelectMenuInteraction | ButtonInteraction,
		targetUser: User
	): Promise<void> {
		// Get the current page
		let page = this.messages[this.index]!;

		// If the page is a callback function such as with `addAsyncPageEmbed` then resolve it here
		page = isFunction(page) ? await page(this.index, this.pages, this) : page;

		// Merge in the advanced options
		page = { ...page, ...(this.paginatedMessageData ?? {}) };

		// If we do not have more than 1 page then there is no reason to add message components
		if (this.pages.length > 1) {
			const messageComponents: (MessageButton | MessageSelectMenu)[] = [];

			for (const interaction of this.actions.values() as IterableIterator<HelpPaginatedMessageAction>) {
				if (isMessageButtonInteraction(interaction)) {
					messageComponents.push(new MessageButton(interaction));
				} else if (interaction.selectMenuIndex === 'set-1') {
					messageComponents.push(
						new MessageSelectMenu({
							options: await Promise.all(
								this.pages.slice(0, 25).map(async (_, index) => ({
									...(await this.selectMenuOptions(
										index + 1,
										this.resolvePaginatedMessageInternationalizationContext(messageOrInteraction, targetUser)
									)),
									value: index.toString(),
									description: `${this.language(LanguageKeys.Globals.PaginatedMessagePage)} ${index + 1}`
								}))
							),
							...interaction
						})
					);
				} else if (this.pages.slice(25).length) {
					messageComponents.push(
						new MessageSelectMenu({
							options: await Promise.all(
								this.pages.slice(25).map(async (_, index) => ({
									...(await this.selectMenuOptions(
										index + 1 + 25,
										this.resolvePaginatedMessageInternationalizationContext(messageOrInteraction, targetUser)
									)),
									value: (index + 25).toString(),
									description: `${this.language(LanguageKeys.Globals.PaginatedMessagePage)} ${index + 1 + 25}`
								}))
							),
							...interaction
						})
					);
				}
			}

			page.components = createPartitionedMessageRow(messageComponents);
		}

		if (this.response) {
			if (isAnyInteraction(this.response)) {
				if (this.response.replied || this.response.deferred) {
					await this.response.editReply(page as WebhookEditMessageOptions);
				} else {
					await this.response.reply(page as WebhookEditMessageOptions);
				}
			} else if (isMessageInstance(this.response)) {
				await this.response.edit(page as WebhookEditMessageOptions);
			}
		} else if (isAnyInteraction(messageOrInteraction)) {
			if (messageOrInteraction.replied || messageOrInteraction.deferred) {
				this.response = await messageOrInteraction.editReply(page);
			} else {
				this.response = await messageOrInteraction.reply({ ...page, fetchReply: true, ephemeral: false });
			}
		} else {
			this.response = await messageOrInteraction.channel.send(page as MessageOptions);
		}
	}
}

function createPartitionedMessageRow(components: (MessageButton | MessageSelectMenu)[]): MessageActionRow[] {
	// Sort all buttons above select menus
	components = components.sort((a, b) => (a.type === 'BUTTON' && b.type === 'SELECT_MENU' ? -1 : 0));

	const buttons = components.slice(0, 5);
	const selectMenu1 = components[5];
	const selectMenu2 = components[6];

	// Map all the components to MessageActionRows
	const actionRows: MessageActionRow[] = [
		new MessageActionRow().setComponents(buttons), //
		new MessageActionRow().setComponents(selectMenu1)
	];

	if (selectMenu2) {
		actionRows.push(new MessageActionRow().setComponents(selectMenu2));
	}

	return actionRows;
}

type HelpPaginatedMessageAction = PaginatedMessageAction & {
	selectMenuIndex?: 'set-1' | 'set-2';
};
