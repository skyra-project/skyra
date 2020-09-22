import { Guild, GuildMember, Role, User } from 'discord.js';

import { Song } from '@lib/structures/music/Song';
import { ScheduleEntity } from '@orm/entities/ScheduleEntity';
import { HungerGamesGame } from '@root/commands/Games/hungergames';
import { LevelTitles } from '@root/commands/Social/level';
import { ProfileTitles } from '@root/commands/Social/profile';
import { StatsGeneral, StatsUptime, StatsUsage } from '@root/commands/System/stats';
import { Moderation } from '@utils/constants';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

import { ModerationAction } from '../Languages';
import { T } from '../Shared';

export * as Globals from './languages/Globals';
export * as Resolvers from './languages/Resolvers';
export * as Inhibitors from './languages/Inhibitors';
export * as Settings from './languages/Settings';
export * as System from './languages/System';
export * as Monitors from './languages/Monitors';
export * as Serializers from './languages/Serializers';
export * as Commands from './languages/Commands';
export * as Arguments from './languages/Arguments';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace LanguageKeys {
	export const defaultLanguage = T<string>('defaultLanguage');
	export const reactionhandlerPrompt = T<string>('reactionhandlerPrompt');
	export const commandmessageMissing = T<string>('commandmessageMissing');
	export const commandmessageMissingRequired = T<(params: { name: string }) => string>('commandmessageMissingRequired');
	export const commandmessageMissingOptionals = T<(params: { possibles: string }) => string>('commandmessageMissingOptionals');
	export const commandmessageNomatch = T<(params: { possibles: string }) => string>('commandmessageNomatch');
	export const commandUnload = T<(params: { type: string; name: string }) => string>('commandUnload');
	export const commandUnloadDescription = T<string>('commandUnloadDescription');
	export const commandTransferError = T<string>('commandTransferError');
	export const commandTransferSuccess = T<(params: { type: string; name: string }) => string>('commandTransferSuccess');
	export const commandTransferFailed = T<(params: { type: string; name: string }) => string>('commandTransferFailed');
	export const commandTransferDescription = T<string>('commandTransferDescription');
	export const commandReload = T<(params: { type: string; name: string; time: string }) => string>('commandReload');
	export const commandReloadAll = T<(params: { type: string; time: string }) => string>('commandReloadAll');
	export const commandReloadEverything = T<(params: { time: string }) => string>('commandReloadEverything');
	export const commandReloadFailed = T<(params: { type: string; name: string }) => string>('commandReloadFailed');
	export const commandReloadDescription = T<string>('commandReloadDescription');
	export const commandReboot = T<string>('commandReboot');
	export const commandRebootDescription = T<string>('commandRebootDescription');
	export const commandPing = T<string>('commandPing');
	export const commandPingDescription = T<string>('commandPingDescription');
	export const commandPingPong = T<(params: { diff: number; ping: number }) => string>('commandPingPong');
	export const commandInfoDescription = T<string>('commandInfoDescription');
	export const commandHelpDescription = T<string>('commandHelpDescription');
	export const commandHelpNoExtended = T<string>('commandHelpNoExtended');
	export const commandHelpDm = T<string>('commandHelpDm');
	export const commandHelpNodm = T<string>('commandHelpNodm');
	export const commandHelpAllFlag = T<(params: { prefix: string }) => string>('commandHelpAllFlag');
	export const commandHelpCommandCount = T<(params: { count: number }) => string>('commandHelpCommandCount');
	export const commandHelpCommandCountPlural = T<(params: { count: number }) => string>('commandHelpCommandCountPlural');
	export const commandEnable = T<(params: { type: string; name: string }) => string>('commandEnable');
	export const commandEnableDescription = T<string>('commandEnableDescription');
	export const commandDisable = T<(params: { type: string; name: string }) => string>('commandDisable');
	export const commandDisableDescription = T<string>('commandDisableDescription');
	export const commandDisableWarn = T<string>('commandDisableWarn');
	export const messagePromptTimeout = T<string>('messagePromptTimeout');
	export const textPromptAbortOptions = T<readonly string[]>('textPromptAbortOptions');
	export const commandLoad = T<(params: { time: string; type: string; name: string }) => string>('commandLoad');
	export const commandLoadFail = T<string>('commandLoadFail');
	export const commandLoadError = T<(params: { type: string; name: string; error: string }) => string>('commandLoadError');
	export const commandLoadDescription = T<string>('commandLoadDescription');
	export const commandAddDescription = T<string>('commandAddDescription');
	export const commandAddExtended = T<LanguageHelpDisplayOptions>('commandAddExtended');
	export const commandAddPlaylist = T<(params: { songs: string }) => string>('commandAddPlaylist');
	export const commandAddPlaylistSongs = T<(params: { count: number }) => string>('commandAddPlaylistSongs');
	export const commandAddPlaylistSongsPlural = T<(params: { count: number }) => string>('commandAddPlaylistSongsPlural');
	export const commandAddSong = T<(params: { title: string }) => string>('commandAddSong');
	export const commandClearDescription = T<string>('commandClearDescription');
	export const commandClearDenied = T<string>('commandClearDenied');
	export const commandClearSuccess = T<(params: { count: number }) => string>('commandClearSuccess');
	export const commandClearSuccessPlural = T<(params: { count: number }) => string>('commandClearSuccessPlural');
	export const commandExportQueueDescription = T<string>('commandExportQueueDescription');
	export const commandExportQueueExtended = T<LanguageHelpDisplayOptions>('commandExportQueueExtended');
	export const commandExportQueueSuccess = T<(params: { guildName: string }) => string>('commandExportQueueSuccess');
	export const commandImportQueueDescription = T<string>('commandImportQueueDescription');
	export const commandImportQueueExtended = T<LanguageHelpDisplayOptions>('commandImportQueueExtended');
	export const commandJoinDescription = T<string>('commandJoinDescription');
	export const commandJoinNoMember = T<string>('commandJoinNoMember');
	export const commandJoinNoVoicechannel = T<string>('commandJoinNoVoicechannel');
	export const commandJoinSuccess = T<(params: { channel: string }) => string>('commandJoinSuccess');
	export const commandJoinVoiceDifferent = T<string>('commandJoinVoiceDifferent');
	export const commandJoinVoiceFull = T<string>('commandJoinVoiceFull');
	export const commandJoinVoiceNoConnect = T<string>('commandJoinVoiceNoConnect');
	export const commandJoinVoiceNoSpeak = T<string>('commandJoinVoiceNoSpeak');
	export const commandJoinVoiceSame = T<string>('commandJoinVoiceSame');
	export const commandJoinFailed = T<string>('commandJoinFailed');
	export const commandLeaveDescription = T<string>('commandLeaveDescription');
	export const commandLeaveExtended = T<LanguageHelpDisplayOptions>('commandLeaveExtended');
	export const commandLeaveSuccess = T<(params: { channel: string }) => string>('commandLeaveSuccess');
	export const commandPauseDescription = T<string>('commandPauseDescription');
	export const commandPauseSuccess = T<string>('commandPauseSuccess');
	export const commandPlayDescription = T<string>('commandPlayDescription');
	export const commandPlayExtended = T<LanguageHelpDisplayOptions>('commandPlayExtended');
	export const commandPlayEnd = T<string>('commandPlayEnd');
	export const commandPlayNext = T<(params: { title: string; requester: string }) => string>('commandPlayNext');
	export const commandPlayQueuePaused = T<(params: { song: string }) => string>('commandPlayQueuePaused');
	export const commandPlayQueuePlaying = T<string>('commandPlayQueuePlaying');
	export const commandPlayQueueEmpty = T<string>('commandPlayQueueEmpty');
	export const commandPlayingDescription = T<string>('commandPlayingDescription');
	export const commandPlayingDuration = T<(params: { duration: string }) => string>('commandPlayingDuration');
	export const commandPlayingQueueEmpty = T<string>('commandPlayingQueueEmpty');
	export const commandPlayingQueueNotPlaying = T<string>('commandPlayingQueueNotPlaying');
	export const commandRepeatDescription = T<string>('commandRepeatDescription');
	export const commandRepeatSuccessEnabled = T<string>('commandRepeatSuccessEnabled');
	export const commandRepeatSuccessDisabled = T<string>('commandRepeatSuccessDisabled');
	export const commandQueueDescription = T<string>('commandQueueDescription');
	export const commandQueueLast = T<string>('commandQueueLast');
	export const commandQueueTitle = T<(params: { guildname: string }) => string>('commandQueueTitle');
	export const commandQueueLine = T<(params: { position: number; duration: string; title: string; url: string; requester: string }) => string>(
		'commandQueueLine'
	);
	export const commandQueueNowplaying = T<(context: { title: string; url: string; requester: string }) => string>('commandQueueNowplaying');
	export const commandQueueNowplayingTimeRemaining = T<(params: { timeRemaining: string }) => string>('commandQueueNowplayingTimeRemaining');
	export const commandQueueNowplayingLiveStream = T<string>('commandQueueNowplayingLiveStream');
	export const commandQueueNowplayingTitle = T<string>('commandQueueNowplayingTitle');
	export const commandQueueTotalTitle = T<string>('commandQueueTotalTitle');
	export const commandQueueTotal = T<(params: { songs: string; remainingTime: string }) => string>('commandQueueTotal');
	export const commandQueueEmpty = T<string>('commandQueueEmpty');
	export const commandQueueDashboardInfo = T<(params: { guild: Guild }) => string>('commandQueueDashboardInfo');
	export const commandRemoveDescription = T<string>('commandRemoveDescription');
	export const commandRemoveIndexInvalid = T<string>('commandRemoveIndexInvalid');
	export const commandRemoveIndexOut = T<(params: { songs: string }) => string>('commandRemoveIndexOut');
	export const commandRemoveDenied = T<string>('commandRemoveDenied');
	export const commandRemoveSuccess = T<(params: { song: Song }) => string>('commandRemoveSuccess');
	export const commandSeekDescription = T<string>('commandSeekDescription');
	export const commandSeekSuccess = T<(params: { time: number }) => string>('commandSeekSuccess');
	export const commandResumeDescription = T<string>('commandResumeDescription');
	export const commandResumeSuccess = T<string>('commandResumeSuccess');
	export const commandShuffleDescription = T<string>('commandShuffleDescription');
	export const commandShuffleSuccess = T<(params: { amount: number }) => string>('commandShuffleSuccess');
	export const commandSkipDescription = T<string>('commandSkipDescription');
	export const commandSkipPermissions = T<string>('commandSkipPermissions');
	export const commandSkipVotesVoted = T<string>('commandSkipVotesVoted');
	export const commandSkipVotesTotal = T<(params: { amount: number; needed: number }) => string>('commandSkipVotesTotal');
	export const commandSkipSuccess = T<(params: { title: string }) => string>('commandSkipSuccess');
	export const commandSupportEmbedTitle = T<(params: { username: string }) => string>('commandSupportEmbedTitle');
	export const commandSupportEmbedDescription = T<string>('commandSupportEmbedDescription');
	export const commandPlayingTimeDescription = T<string>('commandPlayingTimeDescription');
	export const commandPlayingTimeQueueEmpty = T<string>('commandPlayingTimeQueueEmpty');
	export const commandPromoteDescription = T<string>('commandPromoteDescription');
	export const commandPromoteExtended = T<LanguageHelpDisplayOptions>('commandPromoteExtended');
	export const commandPromoteSuccess = T<(params: { song: Song }) => string>('commandPromoteSuccess');
	export const commandVolumeDescription = T<string>('commandVolumeDescription');
	export const commandVolumeSuccess = T<(params: { volume: number }) => string>('commandVolumeSuccess');
	export const commandVolumeChanged = T<(params: { emoji: string; volume: number }) => string>('commandVolumeChanged');
	export const commandVolumeChangedExtreme = T<(params: { emoji: string; text: string; volume: number }) => string>('commandVolumeChangedExtreme');
	export const commandVolumeChangedTexts = T<readonly string[]>('commandVolumeChangedTexts');
	export const commandAbilityDescription = T<string>('commandAbilityDescription');
	export const commandAbilityExtended = T<LanguageHelpDisplayOptions>('commandAbilityExtended');
	export const commandAbilityEmbedTitle = T<string>('commandAbilityEmbedTitle');
	export const commandAbilityQueryFail = T<(params: { ability: string }) => string>('commandAbilityQueryFail');
	export const commandFlavorsDescription = T<string>('commandFlavorsDescription');
	export const commandFlavorsExtended = T<LanguageHelpDisplayOptions>('commandFlavorsExtended');
	export const commandFlavorsQueryFail = T<(params: { pokemon: string }) => string>('commandFlavorsQueryFail');
	export const commandItemDescription = T<string>('commandItemDescription');
	export const commandItemExtended = T<LanguageHelpDisplayOptions>('commandItemExtended');
	export const commandItemEmbedData = T<
		(params: {
			availableInGen8: string;
		}) => {
			ITEM: string;
			generationIntroduced: string;
			availableInGeneration8Title: string;
			availableInGeneration8Data: string;
		}
	>('commandItemEmbedData');
	export const commandItemQueryFail = T<(params: { item: string }) => string>('commandItemQueryFail');
	export const commandLearnDescription = T<string>('commandLearnDescription');
	export const commandLearnExtended = T<LanguageHelpDisplayOptions>('commandLearnExtended');
	export const commandLearnMethodTypes = T<
		(params: {
			level?: number | null;
		}) => {
			levelUpMoves: string;
			eventMoves: string;
			tutorMoves: string;
			eggMoves: string;
			virtualTransferMoves: string;
			tmMoves: string;
			dreamworldMoves: string;
		}
	>('commandLearnMethodTypes');
	export const commandLearnInvalidGeneration = T<(params: { generation: string }) => string>('commandLearnInvalidGeneration');
	export const commandLearnMethod = T<(params: { generation: number; pokemon: string; move: string; method: string }) => string>(
		'commandLearnMethod'
	);
	export const commandLearnQueryFailed = T<(params: { pokemon: string; moves: string }) => string>('commandLearnQueryFailed');
	export const commandLearnCannotLearn = T<(params: { pokemon: string; moves: string }) => string>('commandLearnCannotLearn');
	export const commandLearnTitle = T<(params: { pokemon: string; generation: number }) => string>('commandLearnTitle');
	export const commandMoveDescription = T<string>('commandMoveDescription');
	export const commandMoveExtended = T<LanguageHelpDisplayOptions>('commandMoveExtended');
	export const commandMoveEmbedData = T<
		(params: {
			availableInGen8: string;
		}) => {
			move: string;
			types: string;
			basePower: string;
			pp: string;
			category: string;
			accuracy: string;
			priority: string;
			target: string;
			contestCondition: string;
			zCrystal: string;
			gmaxPokemon: string;
			availableInGeneration8Title: string;
			availableInGeneration8Data: string;
			none: string;
			maxMovePower: string;
			zMovePower: string;
		}
	>('commandMoveEmbedData');
	export const commandMoveQueryFail = T<(params: { move: string }) => string>('commandMoveQueryFail');
	export const commandPokedexDescription = T<string>('commandPokedexDescription');
	export const commandPokedexExtended = T<LanguageHelpDisplayOptions>('commandPokedexExtended');
	export const commandPokedexEmbedData = T<
		(params: {
			otherFormes: readonly string[];
			cosmeticFormes: readonly string[];
		}) => {
			types: string;
			abilities: string;
			genderRatio: string;
			smogonTier: string;
			uknownSmogonTier: string;
			height: string;
			weight: string;
			eggGroups: string;
			evolutionaryLine: string;
			baseStats: string;
			baseStatsTotal: string;
			flavourText: string;
			otherFormesTitle: string;
			cosmeticFormesTitle: string;
			otherFormesList: string;
			cosmeticFormesList: string;
		}
	>('commandPokedexEmbedData');
	export const commandPokedexQueryFail = T<(params: { pokemon: string }) => string>('commandPokedexQueryFail');
	export const commandTypeDescription = T<string>('commandTypeDescription');
	export const commandTypeExtended = T<LanguageHelpDisplayOptions>('commandTypeExtended');
	export const commandTypeEmbedData = T<
		(params: {
			types: string[];
		}) => {
			offensive: string;
			defensive: string;
			superEffectiveAgainst: string;
			dealsNormalDamageTo: string;
			doesNotAffect: string;
			notVeryEffectiveAgainst: string;
			vulnerableTo: string;
			takesNormalDamageFrom: string;
			resists: string;
			notAffectedBy: string;
			typeEffectivenessFor: string;
		}
	>('commandTypeEmbedData');
	export const commandTypeTooManyTypes = T<string>('commandTypeTooManyTypes');
	export const commandTypeNotAType = T<(params: { type: string }) => string>('commandTypeNotAType');
	export const commandTypeQueryFail = T<(params: { types: string }) => string>('commandTypeQueryFail');
	export const musicManagerFetchNoArguments = T<string>('musicManagerFetchNoArguments');
	export const musicManagerFetchNoMatches = T<string>('musicManagerFetchNoMatches');
	export const musicManagerFetchLoadFailed = T<string>('musicManagerFetchLoadFailed');
	export const musicManagerImportQueueNotFound = T<string>('musicManagerImportQueueNotFound');
	export const musicManagerImportQueueError = T<string>('musicManagerImportQueueError');
	export const musicManagerTooManySongs = T<string>('musicManagerTooManySongs');
	export const musicManagerSetvolumeSilent = T<string>('musicManagerSetvolumeSilent');
	export const musicManagerSetvolumeLoud = T<string>('musicManagerSetvolumeLoud');
	export const musicManagerPlayNoSongs = T<string>('musicManagerPlayNoSongs');
	export const musicManagerPlayPlaying = T<string>('musicManagerPlayPlaying');
	export const musicManagerStuck = T<(params: { milliseconds: number }) => string>('musicManagerStuck');
	export const gamesNotEnoughMoney = T<(params: { money: number }) => string>('gamesNotEnoughMoney');
	export const gamesCannotHaveNegativeMone = T<string>('gamesCannotHaveNegativeMoney');
	export const commandCreateMuteDescriptio = T<string>('commandCreateMuteDescription');
	export const commandCreateMuteExtende = T<LanguageHelpDisplayOptions>('commandCreateMuteExtended');
	export const commandGiveawayDescriptio = T<string>('commandGiveawayDescription');
	export const commandGiveawayExtende = T<LanguageHelpDisplayOptions>('commandGiveawayExtended');
	export const commandGiveawayRerollDescriptio = T<string>('commandGiveawayRerollDescription');
	export const commandGiveawayRerollExtende = T<LanguageHelpDisplayOptions>('commandGiveawayRerollExtended');
	export const commandGiveawayScheduleDescriptio = T<string>('commandGiveawayScheduleDescription');
	export const commandGiveawayScheduleExtende = T<LanguageHelpDisplayOptions>('commandGiveawayScheduleExtended');
	export const commandCurrentTimeDescriptio = T<string>('commandCurrentTimeDescription');
	export const commandCurrentTimeExtende = T<LanguageHelpDisplayOptions>('commandCurrentTimeExtended');
	export const commandCurrentTimeLocationNotFoun = T<string>('commandCurrentTimeLocationNotFound');
	export const commandCurrentTimeTitles = T<
		(params: {
			dst: string;
		}) => {
			currentTime: string;
			currentDate: string;
			country: string;
			gmsOffset: string;
			dst: string;
		}
	>('commandCurrentTimeTitles');
	export const commandCurrentTimeDst = T<string>('commandCurrentTimeDst');
	export const commandCurrentTimeNoDst = T<string>('commandCurrentTimeNoDst');
	export const commandGsearchDescription = T<string>('commandGsearchDescription');
	export const commandGsearchExtended = T<LanguageHelpDisplayOptions>('commandGsearchExtended');
	export const commandGimageDescription = T<string>('commandGimageDescription');
	export const commandGimageExtended = T<LanguageHelpDisplayOptions>('commandGimageExtended');
	export const commandLmgtfyDescription = T<string>('commandLmgtfyDescription');
	export const commandLmgtfyExtended = T<LanguageHelpDisplayOptions>('commandLmgtfyExtended');
	export const commandLmgtfyClick = T<string>('commandLmgtfyClick');
	export const commandWeatherDescription = T<string>('commandWeatherDescription');
	export const commandWeatherExtended = T<LanguageHelpDisplayOptions>('commandWeatherExtended');
	export const googleErrorZeroResults = T<string>('googleErrorZeroResults');
	export const googleErrorRequestDenied = T<string>('googleErrorRequestDenied');
	export const googleErrorInvalidRequest = T<string>('googleErrorInvalidRequest');
	export const googleErrorOverQueryLimit = T<string>('googleErrorOverQueryLimit');
	export const googleErrorUnknown = T<string>('googleErrorUnknown');
	export const commandNickDescription = T<string>('commandNickDescription');
	export const commandNickExtended = T<LanguageHelpDisplayOptions>('commandNickExtended');
	export const commandPermissionNodesDescription = T<string>('commandPermissionNodesDescription');
	export const commandPermissionNodesExtended = T<LanguageHelpDisplayOptions>('commandPermissionNodesExtended');
	export const commandTriggersDescription = T<string>('commandTriggersDescription');
	export const commandTriggersExtended = T<LanguageHelpDisplayOptions>('commandTriggersExtended');
	export const commandManagecommandautodeleteDescription = T<string>('commandManagecommandautodeleteDescription');
	export const commandManagecommandautodeleteExtended = T<LanguageHelpDisplayOptions>('commandManagecommandautodeleteExtended');
	export const commandManageCommandChannelDescription = T<string>('commandManageCommandChannelDescription');
	export const commandManageCommandChannelExtended = T<LanguageHelpDisplayOptions>('commandManageCommandChannelExtended');
	export const commandManageReactionRolesDescription = T<string>('commandManageReactionRolesDescription');
	export const commandManageReactionRolesExtended = T<LanguageHelpDisplayOptions>('commandManageReactionRolesExtended');
	export const commandSetIgnoreChannelsDescription = T<string>('commandSetIgnoreChannelsDescription');
	export const commandSetIgnoreChannelsExtended = T<LanguageHelpDisplayOptions>('commandSetIgnoreChannelsExtended');
	export const commandSetImageLogsDescription = T<string>('commandSetImageLogsDescription');
	export const commandSetImageLogsExtended = T<LanguageHelpDisplayOptions>('commandSetImageLogsExtended');
	export const commandSetMemberLogsDescription = T<string>('commandSetMemberLogsDescription');
	export const commandSetMemberLogsExtended = T<LanguageHelpDisplayOptions>('commandSetMemberLogsExtended');
	export const commandSetMessageLogsDescription = T<string>('commandSetMessageLogsDescription');
	export const commandSetMessageLogsExtended = T<LanguageHelpDisplayOptions>('commandSetMessageLogsExtended');
	export const commandSetmodlogsDescription = T<string>('commandSetmodlogsDescription');
	export const commandSetmodlogsExtended = T<LanguageHelpDisplayOptions>('commandSetmodlogsExtended');
	export const commandSetprefixDescription = T<string>('commandSetprefixDescription');
	export const commandSetprefixExtended = T<LanguageHelpDisplayOptions>('commandSetprefixExtended');
	export const commandSetrolechannelDescription = T<string>('commandSetrolechannelDescription');
	export const commandSetrolechannelExtended = T<LanguageHelpDisplayOptions>('commandSetrolechannelExtended');
	export const commandSetrolemessageDescription = T<string>('commandSetrolemessageDescription');
	export const commandSetrolemessageExtended = T<LanguageHelpDisplayOptions>('commandSetrolemessageExtended');
	export const commandSetStarboardEmojiDescription = T<string>('commandSetStarboardEmojiDescription');
	export const commandSetStarboardEmojiExtended = T<LanguageHelpDisplayOptions>('commandSetStarboardEmojiExtended');
	export const commandGiveawayRerollInvalid = T<string>('commandGiveawayRerollInvalid');
	export const commandRoleInfoDescription = T<string>('commandRoleInfoDescription');
	export const commandRoleInfoExtended = T<LanguageHelpDisplayOptions>('commandRoleInfoExtended');
	export const commandGuildInfoDescription = T<string>('commandGuildInfoDescription');
	export const commandGuildInfoExtended = T<LanguageHelpDisplayOptions>('commandGuildInfoExtended');
	export const commandStickyRolesDescription = T<string>('commandStickyRolesDescription');
	export const commandStickyRolesExtended = T<LanguageHelpDisplayOptions>('commandStickyRolesExtended');
	export const commandManageAttachmentsDescription = T<string>('commandManageAttachmentsDescription');
	export const commandManageAttachmentsExtended = T<LanguageHelpDisplayOptions>('commandManageAttachmentsExtended');
	export const commandCapitalsModeDescription = T<string>('commandCapitalsModeDescription');
	export const commandCapitalsModeExtended = T<LanguageHelpDisplayOptions>('commandCapitalsModeExtended');
	export const commandFilterDescription = T<string>('commandFilterDescription');
	export const commandFilterExtended = T<LanguageHelpDisplayOptions>('commandFilterExtended');
	export const commandFilterModeDescription = T<string>('commandFilterModeDescription');
	export const commandFilterModeExtended = T<LanguageHelpDisplayOptions>('commandFilterModeExtended');
	export const commandInviteModeDescription = T<string>('commandInviteModeDescription');
	export const commandInviteModeExtended = T<LanguageHelpDisplayOptions>('commandInviteModeExtended');
	export const commandLinkModeDescription = T<string>('commandLinkModeDescription');
	export const commandLinkModeExtended = T<LanguageHelpDisplayOptions>('commandLinkModeExtended');
	export const commandMessageModeDescription = T<string>('commandMessageModeDescription');
	export const commandMessageModeExtended = T<LanguageHelpDisplayOptions>('commandMessageModeExtended');
	export const commandNewlineModeDescription = T<string>('commandNewlineModeDescription');
	export const commandNewlineModeExtended = T<LanguageHelpDisplayOptions>('commandNewlineModeExtended');
	export const commandReactionModeDescription = T<string>('commandReactionModeDescription');
	export const commandReactionModeExtended = T<LanguageHelpDisplayOptions>('commandReactionModeExtended');
	export const commandCuddleDescription = T<string>('commandCuddleDescription');
	export const commandCuddleExtended = T<LanguageHelpDisplayOptions>('commandCuddleExtended');
	export const commandDeletthisDescription = T<string>('commandDeletthisDescription');
	export const commandDeletthisExtended = T<LanguageHelpDisplayOptions>('commandDeletthisExtended');
	export const commandFDescription = T<string>('commandFDescription');
	export const commandFExtended = T<LanguageHelpDisplayOptions>('commandFExtended');
	export const commandGoodnightDescription = T<string>('commandGoodnightDescription');
	export const commandGoodnightExtended = T<LanguageHelpDisplayOptions>('commandGoodnightExtended');
	export const commandGoofytimeDescription = T<string>('commandGoofytimeDescription');
	export const commandGoofytimeExtended = T<LanguageHelpDisplayOptions>('commandGoofytimeExtended');
	export const commandHugDescription = T<string>('commandHugDescription');
	export const commandHugExtended = T<LanguageHelpDisplayOptions>('commandHugExtended');
	export const commandIneedhealingDescription = T<string>('commandIneedhealingDescription');
	export const commandIneedhealingExtended = T<LanguageHelpDisplayOptions>('commandIneedhealingExtended');
	export const commandRandRedditDescription = T<string>('commandRandRedditDescription');
	export const commandRandRedditExtended = T<LanguageHelpDisplayOptions>('commandRandRedditExtended');
	export const commandChaseDescription = T<string>('commandChaseDescription');
	export const commandChaseExtended = T<LanguageHelpDisplayOptions>('commandChaseExtended');
	export const commandSlapDescription = T<string>('commandSlapDescription');
	export const commandSlapExtended = T<LanguageHelpDisplayOptions>('commandSlapExtended');
	export const commandSnipeDescription = T<string>('commandSnipeDescription');
	export const commandSnipeExtended = T<LanguageHelpDisplayOptions>('commandSnipeExtended');
	export const commandThesearchDescription = T<string>('commandThesearchDescription');
	export const commandThesearchExtended = T<LanguageHelpDisplayOptions>('commandThesearchExtended');
	export const commandTriggeredDescription = T<string>('commandTriggeredDescription');
	export const commandTriggeredExtended = T<LanguageHelpDisplayOptions>('commandTriggeredExtended');
	export const commandUpvoteDescription = T<string>('commandUpvoteDescription');
	export const commandUpvoteExtended = T<LanguageHelpDisplayOptions>('commandUpvoteExtended');
	export const commandSetNicknameDescription = T<string>('commandSetNicknameDescription');
	export const commandSetNicknameExtended = T<LanguageHelpDisplayOptions>('commandSetNicknameExtended');
	export const commandAddRoleDescription = T<string>('commandAddRoleDescription');
	export const commandAddRoleExtended = T<LanguageHelpDisplayOptions>('commandAddRoleExtended');
	export const commandRemoveroleDescription = T<string>('commandRemoveroleDescription');
	export const commandRemoveroleExtended = T<LanguageHelpDisplayOptions>('commandRemoveroleExtended');
	export const commandSlowmodeDescription = T<string>('commandSlowmodeDescription');
	export const commandSlowmodeExtended = T<LanguageHelpDisplayOptions>('commandSlowmodeExtended');
	export const commandBanDescription = T<string>('commandBanDescription');
	export const commandBanExtended = T<LanguageHelpDisplayOptions>('commandBanExtended');
	export const commandDehoistDescription = T<string>('commandDehoistDescription');
	export const commandDehoistExtended = T<LanguageHelpDisplayOptions>('commandDehoistExtended');
	export const commandKickDescription = T<string>('commandKickDescription');
	export const commandKickExtended = T<LanguageHelpDisplayOptions>('commandKickExtended');
	export const commandLockdownDescription = T<string>('commandLockdownDescription');
	export const commandLockdownExtended = T<LanguageHelpDisplayOptions>('commandLockdownExtended');
	export const commandMuteDescription = T<string>('commandMuteDescription');
	export const commandMuteExtended = T<LanguageHelpDisplayOptions>('commandMuteExtended');
	export const commandPruneDescription = T<string>('commandPruneDescription');
	export const commandPruneExtended = T<LanguageHelpDisplayOptions>('commandPruneExtended');
	export const commandReasonDescription = T<string>('commandReasonDescription');
	export const commandReasonExtended = T<LanguageHelpDisplayOptions>('commandReasonExtended');
	export const commandRestrictAttachmentDescription = T<string>('commandRestrictAttachmentDescription');
	export const commandRestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commandRestrictAttachmentExtended');
	export const commandRestrictEmbedDescription = T<string>('commandRestrictEmbedDescription');
	export const commandRestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commandRestrictEmbedExtended');
	export const commandRestrictEmojiDescription = T<string>('commandRestrictEmojiDescription');
	export const commandRestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commandRestrictEmojiExtended');
	export const commandRestrictReactionDescription = T<string>('commandRestrictReactionDescription');
	export const commandRestrictReactionExtended = T<LanguageHelpDisplayOptions>('commandRestrictReactionExtended');
	export const commandRestrictVoiceDescription = T<string>('commandRestrictVoiceDescription');
	export const commandRestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commandRestrictVoiceExtended');
	export const commandSoftBanDescription = T<string>('commandSoftBanDescription');
	export const commandSoftBanExtended = T<LanguageHelpDisplayOptions>('commandSoftBanExtended');
	export const commandToggleModerationDmDescription = T<string>('commandToggleModerationDmDescription');
	export const commandToggleModerationDmExtended = T<LanguageHelpDisplayOptions>('commandToggleModerationDmExtended');
	export const commandUnbanDescription = T<string>('commandUnbanDescription');
	export const commandUnbanExtended = T<LanguageHelpDisplayOptions>('commandUnbanExtended');
	export const commandUnmuteDescription = T<string>('commandUnmuteDescription');
	export const commandUnmuteExtended = T<LanguageHelpDisplayOptions>('commandUnmuteExtended');
	export const commandUnrestrictAttachmentDescription = T<string>('commandUnrestrictAttachmentDescription');
	export const commandUnrestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictAttachmentExtended');
	export const commandUnrestrictEmbedDescription = T<string>('commandUnrestrictEmbedDescription');
	export const commandUnrestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictEmbedExtended');
	export const commandUnrestrictEmojiDescription = T<string>('commandUnrestrictEmojiDescription');
	export const commandUnrestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictEmojiExtended');
	export const commandUnrestrictReactionDescription = T<string>('commandUnrestrictReactionDescription');
	export const commandUnrestrictReactionExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictReactionExtended');
	export const commandUnrestrictVoiceDescription = T<string>('commandUnrestrictVoiceDescription');
	export const commandUnrestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictVoiceExtended');
	export const commandUnwarnDescription = T<string>('commandUnwarnDescription');
	export const commandUnwarnExtended = T<LanguageHelpDisplayOptions>('commandUnwarnExtended');
	export const commandVmuteDescription = T<string>('commandVmuteDescription');
	export const commandVmuteExtended = T<LanguageHelpDisplayOptions>('commandVmuteExtended');
	export const commandVoiceKickDescription = T<string>('commandVoiceKickDescription');
	export const commandVoiceKickExtended = T<LanguageHelpDisplayOptions>('commandVoiceKickExtended');
	export const commandVunmuteDescription = T<string>('commandVunmuteDescription');
	export const commandVunmuteExtended = T<LanguageHelpDisplayOptions>('commandVunmuteExtended');
	export const commandWarnDescription = T<string>('commandWarnDescription');
	export const commandWarnExtended = T<LanguageHelpDisplayOptions>('commandWarnExtended');
	export const commandSocialDescription = T<string>('commandSocialDescription');
	export const commandSocialExtended = T<LanguageHelpDisplayOptions>('commandSocialExtended');
	export const commandBannerDescription = T<string>('commandBannerDescription');
	export const commandBannerExtended = T<LanguageHelpDisplayOptions>('commandBannerExtended');
	export const commandToggleDarkModeDescription = T<string>('commandToggleDarkModeDescription');
	export const commandToggleDarkModeExtended = T<LanguageHelpDisplayOptions>('commandToggleDarkModeExtended');
	export const commandAutoRoleDescription = T<string>('commandAutoRoleDescription');
	export const commandAutoRoleExtended = T<LanguageHelpDisplayOptions>('commandAutoRoleExtended');
	export const commandBalanceDescription = T<string>('commandBalanceDescription');
	export const commandBalanceExtended = T<LanguageHelpDisplayOptions>('commandBalanceExtended');
	export const commandDailyDescription = T<string>('commandDailyDescription');
	export const commandDailyExtended = T<LanguageHelpDisplayOptions>('commandDailyExtended');
	export const commandLeaderboardDescription = T<string>('commandLeaderboardDescription');
	export const commandLeaderboardExtended = T<LanguageHelpDisplayOptions>('commandLeaderboardExtended');
	export const commandLevelDescription = T<string>('commandLevelDescription');
	export const commandLevelExtended = T<LanguageHelpDisplayOptions>('commandLevelExtended');
	export const commandDivorceDescription = T<string>('commandDivorceDescription');
	export const commandDivorceExtended = T<LanguageHelpDisplayOptions>('commandDivorceExtended');
	export const commandMarryDescription = T<string>('commandMarryDescription');
	export const commandMarryExtended = T<LanguageHelpDisplayOptions>('commandMarryExtended');
	export const commandMylevelDescription = T<string>('commandMylevelDescription');
	export const commandMylevelExtended = T<LanguageHelpDisplayOptions>('commandMylevelExtended');
	export const commandPayDescription = T<string>('commandPayDescription');
	export const commandPayExtended = T<LanguageHelpDisplayOptions>('commandPayExtended');
	export const commandProfileDescription = T<string>('commandProfileDescription');
	export const commandProfileExtended = T<LanguageHelpDisplayOptions>('commandProfileExtended');
	export const commandRemindmeDescription = T<string>('commandRemindmeDescription');
	export const commandRemindmeExtended = T<LanguageHelpDisplayOptions>('commandRemindmeExtended');
	export const commandReputationDescription = T<string>('commandReputationDescription');
	export const commandReputationExtended = T<LanguageHelpDisplayOptions>('commandReputationExtended');
	export const commandSetColorDescription = T<string>('commandSetColorDescription');
	export const commandSetColorExtended = T<LanguageHelpDisplayOptions>('commandSetColorExtended');
	export const commandStarDescription = T<string>('commandStarDescription');
	export const commandStarExtended = T<LanguageHelpDisplayOptions>('commandStarExtended');
	export const commandSuggestDescription = T<string>('commandSuggestDescription');
	export const commandSuggestExtended = T<LanguageHelpDisplayOptions>('commandSuggestExtended');
	export const commandResolveSuggestionDescription = T<string>('commandResolveSuggestionDescription');
	export const commandResolveSuggestionExtended = T<LanguageHelpDisplayOptions>('commandResolveSuggestionExtended');
	export const commandDmDescription = T<string>('commandDmDescription');
	export const commandDmExtended = T<LanguageHelpDisplayOptions>('commandDmExtended');
	export const commandEvalDescription = T<string>('commandEvalDescription');
	export const commandEvalExtended = T<LanguageHelpDisplayOptions>('commandEvalExtended');
	export const commandExecDescription = T<string>('commandExecDescription');
	export const commandExecExtended = T<LanguageHelpDisplayOptions>('commandExecExtended');
	export const commandSetAvatarDescription = T<string>('commandSetAvatarDescription');
	export const commandSetAvatarExtended = T<LanguageHelpDisplayOptions>('commandSetAvatarExtended');
	export const commandDonateDescription = T<string>('commandDonateDescription');
	export const commandDonateExtended = T<LanguageHelpDisplayOptions>('commandDonateExtended');
	export const commandEchoDescription = T<string>('commandEchoDescription');
	export const commandEchoExtended = T<LanguageHelpDisplayOptions>('commandEchoExtended');
	export const commandFeedbackDescription = T<string>('commandFeedbackDescription');
	export const commandFeedbackExtended = T<LanguageHelpDisplayOptions>('commandFeedbackExtended');
	export const commandStatsDescription = T<string>('commandStatsDescription');
	export const commandStatsExtended = T<LanguageHelpDisplayOptions>('commandStatsExtended');
	export const commandAvatarDescription = T<string>('commandAvatarDescription');
	export const commandAvatarExtended = T<LanguageHelpDisplayOptions>('commandAvatarExtended');
	export const commandColorDescription = T<string>('commandColorDescription');
	export const commandColorExtended = T<LanguageHelpDisplayOptions>('commandColorExtended');
	export const commandContentDescription = T<string>('commandContentDescription');
	export const commandContentExtended = T<LanguageHelpDisplayOptions>('commandContentExtended');
	export const commandEmojiDescription = T<string>('commandEmojiDescription');
	export const commandEmojiExtended = T<LanguageHelpDisplayOptions>('commandEmojiExtended');
	export const commandCountryDescription = T<string>('commandCountryDescription');
	export const commandCountryExtended = T<LanguageHelpDisplayOptions>('commandCountryExtended');
	export const commandCountryTitles = T<{
		OVERVIEW: string;
		LANGUAGES: string;
		OTHER: string;
	}>('commandCountryTitles');
	export const commandCountryFields = T<{
		overview: {
			officialName: string;
			capital: string;
			population: string;
		};
		other: {
			demonym: string;
			area: string;
			currencies: string;
		};
	}>('commandCountryFields');
	export const commandEshopDescription = T<string>('commandEshopDescription');
	export const commandEshopExtended = T<LanguageHelpDisplayOptions>('commandEshopExtended');
	export const commandEshopNotInDatabase = T<string>('commandEshopNotInDatabase');
	export const commandEshopTitles = T<{
		price: string;
		availability: string;
		releaseDate: string;
		numberOfPlayers: string;
		platform: string;
		categories: string;
		noCategories: string;
		nsuid: 'NSUID';
		esrb: 'ESRB';
	}>('commandEshopTitles');
	export const commandEshopPricePaid = T<(params: { price: number }) => string>('commandEshopPricePaid');
	export const commandEshopPriceFree = T<string>('commandEshopPriceFree');
	export const commandHoroscopeDescription = T<string>('commandHoroscopeDescription');
	export const commandHoroscopeExtended = T<LanguageHelpDisplayOptions>('commandHoroscopeExtended');
	export const commandHoroscopeInvalidSunsign = T<(params: { sign: string; maybe: string }) => string>('commandHoroscopeInvalidSunsign');
	export const commandHoroscopeTitles = T<
		(params: {
			sign: string;
			intensity: string;
			keywords: readonly string[];
			mood: string;
			rating: string;
		}) => {
			dailyHoroscope: string;
			metadataTitle: string;
			metadata: readonly string[];
		}
	>('commandHoroscopeTitles');
	export const commandIgdbDescription = T<string>('commandIgdbDescription');
	export const commandIgdbExtended = T<LanguageHelpDisplayOptions>('commandIgdbExtended');
	export const commandIgdbTitles = T<{
		userScore: string;
		ageRating: string;
		releaseDate: string;
		genres: string;
		developers: string;
		platform: string;
	}>('commandIgdbTitles');
	export const commandIgdbData = T<{
		noDevelopers: string;
		noPlatforms: string;
		noReleaseDate: string;
		noRating: string;
		noSummary: string;
		noAgeRatings: string;
		noGenres: string;
	}>('commandIgdbData');
	export const commandItunesDescription = T<string>('commandItunesDescription');
	export const commandItunesExtended = T<LanguageHelpDisplayOptions>('commandItunesExtended');
	export const commandItunesTitles = T<{
		artist: string;
		collection: string;
		collectionPrice: string;
		trackPrice: string;
		trackReleaseDate: string;
		numberOfTracksInCollection: string;
		primaryGenre: string;
		preview: string;
		previewLabel: string;
	}>('commandItunesTitles');
	export const commandMoviesDescription = T<string>('commandMoviesDescription');
	export const commandMoviesExtended = T<LanguageHelpDisplayOptions>('commandMoviesExtended');
	export const commandMoviesTitles = T<{
		runtime: string;
		userScore: string;
		status: string;
		releaseDate: string;
		imdbPage: string;
		homePage: string;
		collection: string;
		genres: string;
	}>('commandMoviesTitles');
	export const commandMoviesData = T<{
		variableRuntime: string;
		movieInProduction: string;
		linkClickHere: string;
		none: string;
		notPartOfCollection: string;
		noGenres: string;
	}>('commandMoviesData');
	export const commandShowsDescription = T<string>('commandShowsDescription');
	export const commandShowsExtended = T<LanguageHelpDisplayOptions>('commandShowsExtended');
	export const commandShowsTitles = T<{
		episodeRuntime: string;
		userScore: string;
		status: string;
		firstAirDate: string;
		genres: string;
	}>('commandShowsTitles');
	export const commandShowsData = T<{
		variableRuntime: string;
		unknownUserScore: string;
		noGenres: string;
	}>('commandShowsData');
	export const commandPriceDescription = T<string>('commandPriceDescription');
	export const commandPriceExtended = T<LanguageHelpDisplayOptions>('commandPriceExtended');
	export const commandQuoteDescription = T<string>('commandQuoteDescription');
	export const commandQuoteExtended = T<LanguageHelpDisplayOptions>('commandQuoteExtended');
	export const commandRolesDescription = T<string>('commandRolesDescription');
	export const commandRolesExtended = T<LanguageHelpDisplayOptions>('commandRolesExtended');
	export const commandDuckDuckGoDescription = T<string>('commandDuckDuckGoDescription');
	export const commandDuckDuckGoExtended = T<LanguageHelpDisplayOptions>('commandDuckDuckGoExtended');
	export const commandPollDescription = T<string>('commandPollDescription');
	export const commandPollExtended = T<LanguageHelpDisplayOptions>('commandPollExtended');
	export const commandPollReactionLimit = T<string>('commandPollReactionLimit');
	export const commandVoteDescription = T<string>('commandVoteDescription');
	export const commandVoteExtended = T<LanguageHelpDisplayOptions>('commandVoteExtended');
	export const commandTopInvitesDescription = T<string>('commandTopInvitesDescription');
	export const commandTopInvitesExtended = T<LanguageHelpDisplayOptions>('commandTopInvitesExtended');
	export const commandTopInvitesNoInvites = T<string>('commandTopInvitesNoInvites');
	export const commandTopInvitesTop10InvitesFor = T<(params: { guild: Guild }) => string>('commandTopInvitesTop10InvitesFor');
	export const commandTopInvitesEmbedData = T<{
		channel: string;
		link: string;
		createdAt: string;
		createdAtUnknown: string;
		expiresIn: string;
		neverExpress: string;
		temporary: string;
		uses: string;
	}>('commandTopInvitesEmbedData');
	export const commandUrbanDescription = T<string>('commandUrbanDescription');
	export const commandUrbanExtended = T<LanguageHelpDisplayOptions>('commandUrbanExtended');
	export const commandWhoisDescription = T<string>('commandWhoisDescription');
	export const commandWhoisExtended = T<LanguageHelpDisplayOptions>('commandWhoisExtended');
	export const commandFollowageDescription = T<string>('commandFollowageDescription');
	export const commandFollowageExtended = T<LanguageHelpDisplayOptions>('commandFollowageExtended');
	export const commandTwitchDescription = T<string>('commandTwitchDescription');
	export const commandTwitchExtended = T<LanguageHelpDisplayOptions>('commandTwitchExtended');
	export const commandTwitchSubscriptionDescription = T<string>('commandTwitchSubscriptionDescription');
	export const commandTwitchSubscriptionExtended = T<LanguageHelpDisplayOptions>('commandTwitchSubscriptionExtended');
	export const commandWikipediaDescription = T<string>('commandWikipediaDescription');
	export const commandWikipediaExtended = T<LanguageHelpDisplayOptions>('commandWikipediaExtended');
	export const commandYoutubeDescription = T<string>('commandYoutubeDescription');
	export const commandYoutubeExtended = T<LanguageHelpDisplayOptions>('commandYoutubeExtended');
	export const commandWbangDescription = T<string>('commandWbangDescription');
	export const commandWbangExtended = T<LanguageHelpDisplayOptions>('commandWbangExtended');
	export const commandWbangheadDescription = T<string>('commandWbangheadDescription');
	export const commandWbangheadExtended = T<LanguageHelpDisplayOptions>('commandWbangheadExtended');
	export const commandWbiteDescription = T<string>('commandWbiteDescription');
	export const commandWbiteExtended = T<LanguageHelpDisplayOptions>('commandWbiteExtended');
	export const commandWblushDescription = T<string>('commandWblushDescription');
	export const commandWblushExtended = T<LanguageHelpDisplayOptions>('commandWblushExtended');
	export const commandWcryDescription = T<string>('commandWcryDescription');
	export const commandWcryExtended = T<LanguageHelpDisplayOptions>('commandWcryExtended');
	export const commandWcuddleDescription = T<string>('commandWcuddleDescription');
	export const commandWcuddleExtended = T<LanguageHelpDisplayOptions>('commandWcuddleExtended');
	export const commandWdanceDescription = T<string>('commandWdanceDescription');
	export const commandWdanceExtended = T<LanguageHelpDisplayOptions>('commandWdanceExtended');
	export const commandWgreetDescription = T<string>('commandWgreetDescription');
	export const commandWgreetExtended = T<LanguageHelpDisplayOptions>('commandWgreetExtended');
	export const commandWhugDescription = T<string>('commandWhugDescription');
	export const commandWhugExtended = T<LanguageHelpDisplayOptions>('commandWhugExtended');
	export const commandWkissDescription = T<string>('commandWkissDescription');
	export const commandWkissExtended = T<LanguageHelpDisplayOptions>('commandWkissExtended');
	export const commandWlewdDescription = T<string>('commandWlewdDescription');
	export const commandWlewdExtended = T<LanguageHelpDisplayOptions>('commandWlewdExtended');
	export const commandWlickDescription = T<string>('commandWlickDescription');
	export const commandWlickExtended = T<LanguageHelpDisplayOptions>('commandWlickExtended');
	export const commandWnomDescription = T<string>('commandWnomDescription');
	export const commandWnomExtended = T<LanguageHelpDisplayOptions>('commandWnomExtended');
	export const commandWnekoDescription = T<string>('commandWnekoDescription');
	export const commandWnekoExtended = T<LanguageHelpDisplayOptions>('commandWnekoExtended');
	export const commandWpatDescription = T<string>('commandWpatDescription');
	export const commandWpatExtended = T<LanguageHelpDisplayOptions>('commandWpatExtended');
	export const commandWpoutDescription = T<string>('commandWpoutDescription');
	export const commandWpoutExtended = T<LanguageHelpDisplayOptions>('commandWpoutExtended');
	export const commandWpunchDescription = T<string>('commandWpunchDescription');
	export const commandWpunchExtended = T<LanguageHelpDisplayOptions>('commandWpunchExtended');
	export const commandWslapDescription = T<string>('commandWslapDescription');
	export const commandWslapExtended = T<LanguageHelpDisplayOptions>('commandWslapExtended');
	export const commandWsleepyDescription = T<string>('commandWsleepyDescription');
	export const commandWsleepyExtended = T<LanguageHelpDisplayOptions>('commandWsleepyExtended');
	export const commandWsmileDescription = T<string>('commandWsmileDescription');
	export const commandWsmileExtended = T<LanguageHelpDisplayOptions>('commandWsmileExtended');
	export const commandWsmugDescription = T<string>('commandWsmugDescription');
	export const commandWsmugExtended = T<LanguageHelpDisplayOptions>('commandWsmugExtended');
	export const commandWstareDescription = T<string>('commandWstareDescription');
	export const commandWstareExtended = T<LanguageHelpDisplayOptions>('commandWstareExtended');
	export const commandWthumbsupDescription = T<string>('commandWthumbsupDescription');
	export const commandWthumbsupExtended = T<LanguageHelpDisplayOptions>('commandWthumbsupExtended');
	export const commandWtickleDescription = T<string>('commandWtickleDescription');
	export const commandWtickleExtended = T<LanguageHelpDisplayOptions>('commandWtickleExtended');
	export const commandInviteDescription = T<string>('commandInviteDescription');
	export const commandInviteExtended = T<LanguageHelpDisplayOptions>('commandInviteExtended');
	export const commandInvitePermissionInviteText = T<string>('commandInvitePermissionInviteText');
	export const commandInvitePermissionSupportServerText = T<string>('commandInvitePermissionSupportServerText');
	export const commandInvitePermissionsDescription = T<string>('commandInvitePermissionsDescription');
	export const commandInfoBody = T<string[]>('commandInfoBody');
	export const commandHelpData = T<
		(params: {
			titleDescription: string;
			usage: string;
			extendedHelp: string;
			footerName: string;
		}) => {
			title: string;
			usage: string;
			extended: string;
			footer: string;
		}
	>('commandHelpData');
	export const commandSupportDescription = T<string>('commandSupportDescription');
	export const commandSupportExtended = T<LanguageHelpDisplayOptions>('commandSupportExtended');
	export const commandGamesSkyra = T<string>('commandGamesSkyra');
	export const commandGamesBot = T<string>('commandGamesBot');
	export const commandGamesSelf = T<string>('commandGamesSelf');
	export const commandGamesProgress = T<string>('commandGamesProgress');
	export const commandGamesNoPlayers = T<(params: { prefix: string }) => string>('commandGamesNoPlayers');
	export const commandGamesTooManyOrFew = T<(params: { min: number; max: number }) => string>('commandGamesTooManyOrFew');
	export const commandGamesRepeat = T<string>('commandGamesRepeat');
	export const commandGamesPromptTimeout = T<string>('commandGamesPromptTimeout');
	export const commandGamesPromptDeny = T<string>('commandGamesPromptDeny');
	export const commandGamesTimeout = T<string>('commandGamesTimeout');
	export const commandC4Description = T<string>('commandC4Description');
	export const commandC4Extended = T<LanguageHelpDisplayOptions>('commandC4Extended');
	export const commandC4Prompt = T<(params: { challenger: string; challengee: string }) => string>('commandC4Prompt');
	export const commandC4Start = T<(params: { player: string }) => string>('commandC4Start');
	export const commandC4GameColumnFull = T<string>('commandC4GameColumnFull');
	export const commandC4GameWin = T<(params: { user: string }) => string>('commandC4GameWin');
	export const commandC4GameWinTurn0 = T<(params: { user: string }) => string>('commandC4GameWinTurn0');
	export const commandC4GameDraw = T<string>('commandC4GameDraw');
	export const commandC4GameNext = T<(params: { user: string }) => string>('commandC4GameNext');
	export const commandC4GameNextTurn0 = T<(params: { user: string }) => string>('commandC4GameNextTurn0');
	export const commandCoinFlipDescription = T<string>('commandCoinFlipDescription');
	export const commandCoinFlipExtended = T<LanguageHelpDisplayOptions>('commandCoinFlipExtended');
	export const commandCoinFlipInvalidCoinname = T<(params: { arg: string }) => string>('commandCoinFlipInvalidCoinname');
	export const commandCoinFlipCoinnames = T<string[]>('commandCoinFlipCoinnames');
	export const commandCoinFlipWinTitle = T<string>('commandCoinFlipWinTitle');
	export const commandCoinFlipLoseTitle = T<string>('commandCoinFlipLoseTitle');
	export const commandCoinFlipNoguessTitle = T<string>('commandCoinFlipNoguessTitle');
	export const commandCoinFlipWinDescription = T<(params: { result: string }) => string>('commandCoinFlipWinDescription');
	export const commandCoinFlipWinDescriptionWithWager = T<(params: { result: string; wager: number }) => string>(
		'commandCoinFlipWinDescriptionWithWager'
	);
	export const commandCoinFlipLoseDescription = T<(params: { result: string }) => string>('commandCoinFlipLoseDescription');
	export const commandCoinFlipLoseDescriptionWithWager = T<(params: { result: string; wager: number }) => string>(
		'commandCoinFlipLoseDescriptionWithWager'
	);
	export const commandCoinFlipNoguessDescription = T<(params: { result: string }) => string>('commandCoinFlipNoguessDescription');
	export const commandHigherLowerDescription = T<string>('commandHigherLowerDescription');
	export const commandHigherLowerExtended = T<LanguageHelpDisplayOptions>('commandHigherLowerExtended');
	export const commandHigherLowerLoading = T<string>('commandHigherLowerLoading');
	export const commandHigherLowerNewround = T<string>('commandHigherLowerNewround');
	export const commandHigherLowerEmbed = T<
		(params: {
			turn: number;
			number: number;
		}) => {
			title: string;
			description: string;
			footer: string;
		}
	>('commandHigherLowerEmbed');
	export const commandHigherLowerLose = T<
		(params: {
			number: number;
			losses: number;
		}) => {
			title: string;
			description: string;
			footer: string;
		}
	>('commandHigherLowerLose');
	export const commandHigherLowerWin = T<
		(params: {
			potentials: number;
			number: number;
		}) => {
			title: string;
			description: string;
			footer: string;
		}
	>('commandHigherLowerWin');
	export const commandHigherLowerCancel = T<
		(params: {
			username: string;
		}) => {
			title: string;
			description: string;
		}
	>('commandHigherLowerCancel');
	export const commandHigherLowerCashout = T<(params: { amount: number }) => string>('commandHigherLowerCashout');
	export const commandHungerGamesDescription = T<string>('commandHungerGamesDescription');
	export const commandHungerGamesExtended = T<LanguageHelpDisplayOptions>('commandHungerGamesExtended');
	export const commandHungerGamesResultHeaderBloodbath = T<(params: { game: HungerGamesGame }) => string>(
		'commandHungerGamesResultHeaderBloodbath'
	);
	export const commandHungerGamesResultHeaderSun = T<(params: { game: HungerGamesGame }) => string>('commandHungerGamesResultHeaderSun');
	export const commandHungerGamesResultHeaderMoon = T<(params: { game: HungerGamesGame }) => string>('commandHungerGamesResultHeaderMoon');
	export const commandHungerGamesResultDeaths = T<(params: { deaths: number }) => string>('commandHungerGamesResultDeaths');
	export const commandHungerGamesResultDeathsPlural = T<(params: { deaths: number }) => string>('commandHungerGamesResultDeathsPlural');
	export const commandHungerGamesResultProceed = T<string>('commandHungerGamesResultProceed');
	export const commandHungerGamesStop = T<string>('commandHungerGamesStop');
	export const commandHungerGamesWinner = T<(params: { winner: string }) => string>('commandHungerGamesWinner');
	export const commandSlotmachineDescription = T<string>('commandSlotmachineDescription');
	export const commandSlotmachineExtended = T<LanguageHelpDisplayOptions>('commandSlotmachineExtended');
	export const commandSlotmachinesWin = T<(params: { roll: string; winnings: number }) => string>('commandSlotmachinesWin');
	export const commandSlotmachinesLoss = T<(params: { roll: string }) => string>('commandSlotmachinesLoss');
	export const commandSlotmachineTitles = T<{
		previous: string;
		new: string;
	}>('commandSlotmachineTitles');
	export const commandSlotmachineCanvasTextWon = T<string>('commandSlotmachineCanvasTextWon');
	export const commandSlotmachineCanvasTextLost = T<string>('commandSlotmachineCanvasTextLost');
	export const commandTicTacToeDescription = T<string>('commandTicTacToeDescription');
	export const commandTicTacToeExtended = T<LanguageHelpDisplayOptions>('commandTicTacToeExtended');
	export const commandWheelOfFortuneDescription = T<string>('commandWheelOfFortuneDescription');
	export const commandWheelOfFortuneExtended = T<LanguageHelpDisplayOptions>('commandWheelOfFortuneExtended');
	export const commandWheelOfFortuneCanvasTextWon = T<string>('commandWheelOfFortuneCanvasTextWon');
	export const commandWheelOfFortuneCanvasTextLost = T<string>('commandWheelOfFortuneCanvasTextLost');
	export const commandWheelOfFortuneTitles = T<{
		previous: string;
		new: string;
	}>('commandWheelOfFortuneTitles');
	export const commandTicTacToePrompt = T<(params: { challenger: string; challengee: string }) => string>('commandTicTacToePrompt');
	export const commandTicTacToeTurn = T<(params: { icon: string; player: string; board: string }) => string>('commandTicTacToeTurn');
	export const commandTicTacToeWinner = T<(params: { winner: string; board: string }) => string>('commandTicTacToeWinner');
	export const commandTicTacToeDraw = T<(params: { board: string }) => string>('commandTicTacToeDraw');
	export const commandTriviaDescription = T<string>('commandTriviaDescription');
	export const commandTriviaExtended = T<LanguageHelpDisplayOptions>('commandTriviaExtended');
	export const commandTriviaInvalidCategory = T<string>('commandTriviaInvalidCategory');
	export const commandTriviaActiveGame = T<string>('commandTriviaActiveGame');
	export const commandTriviaIncorrect = T<(params: { attempt: string }) => string>('commandTriviaIncorrect');
	export const commandTriviaNoAnswer = T<(params: { correctAnswer: string }) => string>('commandTriviaNoAnswer');
	export const commandTriviaEmbedTitles = T<{
		trivia: string;
		difficulty: string;
	}>('commandTriviaEmbedTitles');
	export const commandTriviaWinner = T<(params: { winner: string; correctAnswer: string }) => string>('commandTriviaWinner');
	export const commandVaultDescription = T<string>('commandVaultDescription');
	export const commandVaultExtended = T<LanguageHelpDisplayOptions>('commandVaultExtended');
	export const commandVaultEmbedData = T<
		(params: {
			coins?: number;
		}) => {
			depositedDescription: string;
			withdrewDescription: string;
			showDescription: string;
			accountMoney: string;
			accountVault: string;
		}
	>('commandVaultEmbedData');
	export const commandVaultInvalidCoins = T<string>('commandVaultInvalidCoins');
	export const commandVaultNotEnoughMoney = T<(params: { money: number }) => string>('commandVaultNotEnoughMoney');
	export const commandVaultNotEnoughInVault = T<(params: { vault: number }) => string>('commandVaultNotEnoughInVault');
	export const giveawayTime = T<string>('giveawayTime');
	export const giveawayTimeTooLong = T<string>('giveawayTimeTooLong');
	export const giveawayEndsAt = T<string>('giveawayEndsAt');
	export const giveawayDuration = T<(params: { time: number }) => string>('giveawayDuration');
	export const giveawayTitle = T<string>('giveawayTitle');
	export const giveawayLastchance = T<(params: { time: number }) => string>('giveawayLastchance');
	export const giveawayLastchanceTitle = T<string>('giveawayLastchanceTitle');
	export const giveawayEnded = T<(params: { winners: string; count: number }) => string>('giveawayEnded');
	export const giveawayEndedPlural = T<(params: { winners: string; count: number }) => string>('giveawayEndedPlural');
	export const giveawayEndedNoWinner = T<string>('giveawayEndedNoWinner');
	export const giveawayEndedAt = T<string>('giveawayEndedAt');
	export const giveawayEndedTitle = T<string>('giveawayEndedTitle');
	export const giveawayEndedMessage = T<(params: { winners: readonly string[]; title: string }) => string>('giveawayEndedMessage');
	export const giveawayEndedMessageNoWinner = T<(params: { title: string }) => string>('giveawayEndedMessageNoWinner');
	export const giveawayScheduled = T<(params: { scheduledTime: number }) => string>('giveawayScheduled');
	export const commandNickSet = T<(params: { nickname: string }) => string>('commandNickSet');
	export const commandNickCleared = T<string>('commandNickCleared');
	export const commandPermissionNodesHigher = T<string>('commandPermissionNodesHigher');
	export const commandPermissionNodesInvalidType = T<string>('commandPermissionNodesInvalidType');
	export const commandPermissionNodesAdd = T<string>('commandPermissionNodesAdd');
	export const commandPermissionNodesNodeNotExists = T<string>('commandPermissionNodesNodeNotExists');
	export const commandPermissionNodesCommandNotExists = T<string>('commandPermissionNodesCommandNotExists');
	export const commandPermissionNodesRemove = T<string>('commandPermissionNodesRemove');
	export const commandPermissionNodesReset = T<string>('commandPermissionNodesReset');
	export const commandPermissionNodesShowName = T<(params: { name: string }) => string>('commandPermissionNodesShowName');
	export const commandPermissionNodesShowAllow = T<(params: { allow: string }) => string>('commandPermissionNodesShowAllow');
	export const commandPermissionNodesShowDeny = T<(params: { deny: string }) => string>('commandPermissionNodesShowDeny');
	export const commandTriggersNotype = T<string>('commandTriggersNotype');
	export const commandTriggersNooutput = T<string>('commandTriggersNooutput');
	export const commandTriggersInvalidreaction = T<string>('commandTriggersInvalidreaction');
	export const commandTriggersInvalidalias = T<string>('commandTriggersInvalidalias');
	export const commandTriggersRemoveNottaken = T<string>('commandTriggersRemoveNottaken');
	export const commandTriggersRemove = T<string>('commandTriggersRemove');
	export const commandTriggersAddTaken = T<string>('commandTriggersAddTaken');
	export const commandTriggersAdd = T<string>('commandTriggersAdd');
	export const commandTriggersListEmpty = T<string>('commandTriggersListEmpty');
	export const commandGuildInfoTitles = T<Record<string, string>>('commandGuildInfoTitles');
	export const commandGuildInfoRoles = T<(params: { roles: string }) => string>('commandGuildInfoRoles');
	export const commandGuildInfoNoroles = T<string>('commandGuildInfoNoroles');
	export const commandGuildInfoChannels = T<(params: { text: number; voice: number; categories: number; afkChannelText: string }) => string[]>(
		'commandGuildInfoChannels'
	);
	export const commandGuildInfoChannelsAfkChannelText = T<(params: { afkChannel: string; afkTime: number }) => string>(
		'commandGuildInfoChannelsAfkChannelText'
	);
	export const commandGuildInfoMembers = T<(params: { count: string; owner: User }) => string[]>('commandGuildInfoMembers');
	export const commandGuildInfoOther = T<
		(params: { size: number; region: string; createdAt: number; verificationLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' }) => string[]
	>('commandGuildInfoOther');
	export const commandRoleInfoTitles = T<Record<string, string>>('commandRoleInfoTitles');
	export const commandRoleInfoData = T<(params: { role: Role; hoisted: string; mentionable: string }) => string[]>('commandRoleInfoData');
	export const commandRoleInfoAll = T<string>('commandRoleInfoAll');
	export const commandRoleInfoNoPermissions = T<string>('commandRoleInfoNoPermissions');
	export const commandFilterUndefinedWord = T<string>('commandFilterUndefinedWord');
	export const commandFilterAlreadyFiltered = T<string>('commandFilterAlreadyFiltered');
	export const commandFilterNotFiltered = T<string>('commandFilterNotFiltered');
	export const commandFilterAdded = T<(params: { word: string }) => string>('commandFilterAdded');
	export const commandFilterRemoved = T<(params: { word: string }) => string>('commandFilterRemoved');
	export const commandFilterReset = T<string>('commandFilterReset');
	export const commandFilterShowEmpty = T<string>('commandFilterShowEmpty');
	export const commandFilterShow = T<(params: { words: string }) => string>('commandFilterShow');
	export const commandManageAttachmentsRequiredValue = T<string>('commandManageAttachmentsRequiredValue');
	export const commandManageAttachmentsInvalidAction = T<string>('commandManageAttachmentsInvalidAction');
	export const commandManageAttachmentsMaximum = T<(params: { value: number }) => string>('commandManageAttachmentsMaximum');
	export const commandManageAttachmentsExpire = T<(params: { value: number }) => string>('commandManageAttachmentsExpire');
	export const commandManageAttachmentsDuration = T<(params: { value: number }) => string>('commandManageAttachmentsDuration');
	export const commandManageAttachmentsAction = T<string>('commandManageAttachmentsAction');
	export const commandManageAttachmentsLogs = T<string>('commandManageAttachmentsLogs');
	export const commandManageAttachmentsEnabled = T<string>('commandManageAttachmentsEnabled');
	export const commandManageAttachmentsDisabled = T<string>('commandManageAttachmentsDisabled');
	export const commandManageCommandAutoDeleteTextChannel = T<string>('commandManageCommandAutoDeleteTextChannel');
	export const commandManageCommandAutoDeleteRequiredDuration = T<string>('commandManageCommandAutoDeleteRequiredDuration');
	export const commandManageCommandAutoDeleteShowEmpty = T<string>('commandManageCommandAutoDeleteShowEmpty');
	export const commandManageCommandAutoDeleteShow = T<(params: { codeblock: string }) => string>('commandManageCommandAutoDeleteShow');
	export const commandManageCommandAutoDeleteAdd = T<(params: { channel: string; time: number }) => string>('commandManageCommandAutoDeleteAdd');
	export const commandManageCommandAutoDeleteRemove = T<(params: { channel: string }) => string>('commandManageCommandAutoDeleteRemove');
	export const commandManageCommandAutoDeleteRemoveNotset = T<(params: { channel: string }) => string>(
		'commandManageCommandAutoDeleteRemoveNotset'
	);
	export const commandManageCommandAutoDeleteReset = T<string>('commandManageCommandAutoDeleteReset');
	export const commandManageCommandChannelTextChannel = T<string>('commandManageCommandChannelTextChannel');
	export const commandManageCommandChannelRequiredCommand = T<string>('commandManageCommandChannelRequiredCommand');
	export const commandManageCommandChannelShow = T<(params: { channel: string; commands: string }) => string>('commandManageCommandChannelShow');
	export const commandManageCommandChannelShowEmpty = T<string>('commandManageCommandChannelShowEmpty');
	export const commandManageCommandChannelAddAlreadyset = T<string>('commandManageCommandChannelAddAlreadyset');
	export const commandManageCommandChannelAdd = T<(params: { channel: string; command: string }) => string>('commandManageCommandChannelAdd');
	export const commandManageCommandChannelRemoveNotset = T<(params: { channel: string }) => string>('commandManageCommandChannelRemoveNotset');
	export const commandManageCommandChannelRemove = T<(params: { channel: string; command: string }) => string>('commandManageCommandChannelRemove');
	export const commandManageCommandChannelResetEmpty = T<string>('commandManageCommandChannelResetEmpty');
	export const commandManageCommandChannelReset = T<(params: { channel: string }) => string>('commandManageCommandChannelReset');
	export const commandManageReactionRolesShowEmpty = T<string>('commandManageReactionRolesShowEmpty');
	export const commandManageReactionRolesAddPrompt = T<string>('commandManageReactionRolesAddPrompt');
	export const commandManageReactionRolesAddChannel = T<(params: { emoji: string; channel: string }) => string>(
		'commandManageReactionRolesAddChannel'
	);
	export const commandManageReactionRolesAddMissing = T<string>('commandManageReactionRolesAddMissing');
	export const commandManageReactionRolesAdd = T<(params: { emoji: string; url: string }) => string>('commandManageReactionRolesAdd');
	export const commandManageReactionRolesRemoveNotExists = T<string>('commandManageReactionRolesRemoveNotExists');
	export const commandManageReactionRolesRemove = T<(params: { emoji: string; url: string }) => string>('commandManageReactionRolesRemove');
	export const commandManageReactionRolesResetEmpty = T<string>('commandManageReactionRolesResetEmpty');
	export const commandManageReactionRolesReset = T<string>('commandManageReactionRolesReset');
	export const commandSetStarboardEmojiSet = T<(params: { emoji: string }) => string>('commandSetStarboardEmojiSet');
	export const configurationTextChannelRequired = T<string>('configurationTextChannelRequired');
	export const configurationEquals = T<string>('configurationEquals');
	export const commandSetIgnoreChannelsSet = T<(params: { channel: string }) => string>('commandSetIgnoreChannelsSet');
	export const commandSetIgnoreChannelsRemoved = T<(params: { channel: string }) => string>('commandSetIgnoreChannelsRemoved');
	export const commandSetImageLogsSet = T<(params: { channel: string }) => string>('commandSetImageLogsSet');
	export const commandSetMemberLogsSet = T<(params: { channel: string }) => string>('commandSetMemberLogsSet');
	export const commandSetMessageLogsSet = T<(params: { channel: string }) => string>('commandSetMessageLogsSet');
	export const commandSetModLogsSet = T<(params: { channel: string }) => string>('commandSetModLogsSet');
	export const commandSetPrefixSet = T<(params: { prefix: string }) => string>('commandSetPrefixSet');
	export const commandStickyRolesRequiredUser = T<string>('commandStickyRolesRequiredUser');
	export const commandStickyRolesRequiredRole = T<string>('commandStickyRolesRequiredRole');
	export const commandStickyRolesNotExists = T<(params: { user: string }) => string>('commandStickyRolesNotExists');
	export const commandStickyRolesReset = T<(params: { user: string }) => string>('commandStickyRolesReset');
	export const commandStickyRolesRemove = T<(params: { user: string }) => string>('commandStickyRolesRemove');
	export const commandStickyRolesAddExists = T<(params: { user: string }) => string>('commandStickyRolesAddExists');
	export const commandStickyRolesAdd = T<(params: { user: string }) => string>('commandStickyRolesAdd');
	export const commandStickyRolesShowEmpty = T<string>('commandStickyRolesShowEmpty');
	export const commandStickyRolesShowSingle = T<(params: { user: string; roles: string }) => string>('commandStickyRolesShowSingle');
	export const commandRandRedditRequiredReddit = T<string>('commandRandRedditRequiredReddit');
	export const commandRandRedditInvalidArgument = T<string>('commandRandRedditInvalidArgument');
	export const commandRandRedditBanned = T<string>('commandRandRedditBanned');
	export const commandRandRedditFail = T<string>('commandRandRedditFail');
	export const commandRandRedditAllNsfw = T<string>('commandRandRedditAllNsfw');
	export const commandRandRedditAllNsfl = T<string>('commandRandRedditAllNsfl');
	export const commandRandRedditMessage = T<(params: { title: string; author: string; url: string }) => string>('commandRandRedditMessage');
	export const commandRandRedditErrorPrivate = T<string>('commandRandRedditErrorPrivate');
	export const commandRandRedditErrorQuarantined = T<string>('commandRandRedditErrorQuarantined');
	export const commandRandRedditErrorNotFound = T<string>('commandRandRedditErrorNotFound');
	export const commandRandRedditErrorBanned = T<string>('commandRandRedditErrorBanned');
	export const commandRedditUserDescription = T<string>('commandRedditUserDescription');
	export const commandRedditUserExtended = T<LanguageHelpDisplayOptions>('commandRedditUserExtended');
	export const commandRedditUserComplexityLevels = T<string[]>('commandRedditUserComplexityLevels');
	export const commandRedditUserInvalidUser = T<(params: { user: string }) => string>('commandRedditUserInvalidUser');
	export const commandRedditUserQueryFailed = T<string>('commandRedditUserQueryFailed');
	export const commandRedditUserTitles = T<{
		linkKarma: string;
		commentKarma: string;
		totalComments: string;
		totalSubmissions: string;
		commentControversiality: string;
		textComplexity: string;
		top5Subreddits: string;
		bySubmissions: string;
		byComments: string;
		bestComment: string;
		worstComment: string;
	}>('commandRedditUserTitles');
	export const commandRedditUserData = T<
		(params: {
			user: string;
			timestamp: string;
		}) => {
			overviewFor: string;
			permalink: string;
			dataAvailableFor: string;
			joinedReddit: string;
		}
	>('commandRedditUserData');
	export const commandShipDescription = T<string>('commandShipDescription');
	export const commandShipExtended = <LanguageHelpDisplayOptions>'commandShipExtended';
	export const commandShipData = T<
		(params: {
			romeoUsername: string;
			julietUsername: string;
			shipName: string;
		}) => {
			title: string;
			description: string;
		}
	>('commandShipData');
	export const commandSnipeEmpty = T<string>('commandSnipeEmpty');
	export const commandSnipeTitle = T<string>('commandSnipeTitle');
	export const commandUpvoteMessage = T<string>('commandUpvoteMessage');
	export const commandVaporwaveDescription = T<string>('commandVaporwaveDescription');
	export const commandVaporwaveExtended = T<LanguageHelpDisplayOptions>('commandVaporwaveExtended');
	export const commandVaporwaveOutput = T<(params: { str: string }) => string>('commandVaporwaveOutput');
	export const commandHistoryDescription = T<string>('commandHistoryDescription');
	export const commandHistoryExtended = T<LanguageHelpDisplayOptions>('commandHistoryExtended');
	export const commandHistoryFooterNew = T<
		(params: {
			warnings: number;
			mutes: number;
			kicks: number;
			bans: number;
			warningsText: string;
			mutesText: string;
			kicksText: string;
			bansText: string;
		}) => string
	>('commandHistoryFooterNew');
	export const commandHistoryFooterWarning = T<(params: { count: number }) => string>('commandHistoryFooterWarning');
	export const commandHistoryFooterWarningPlural = T<(params: { count: number }) => string>('commandHistoryFooterWarningPlural');
	export const commandHistoryFooterMutes = T<(params: { count: number }) => string>('commandHistoryFooterMutes');
	export const commandHistoryFooterMutesPlural = T<(params: { count: number }) => string>('commandHistoryFooterMutesPlural');
	export const commandHistoryFooterKicks = T<(params: { count: number }) => string>('commandHistoryFooterKicks');
	export const commandHistoryFooterKicksPlural = T<(params: { count: number }) => string>('commandHistoryFooterKicksPlural');
	export const commandHistoryFooterBans = T<(params: { count: number }) => string>('commandHistoryFooterBans');
	export const commandHistoryFooterBansPlural = T<(params: { count: number }) => string>('commandHistoryFooterBansPlural');
	export const commandModerationsDescription = T<string>('commandModerationsDescription');
	export const commandModerationsExtended = T<LanguageHelpDisplayOptions>('commandModerationsExtended');
	export const commandModerationsEmpty = T<string>('commandModerationsEmpty');
	export const commandModerationsAmount = T<(params: { count: number }) => string>('commandModerationsAmount');
	export const commandModerationsAmountPlural = T<(params: { count: number }) => string>('commandModerationsAmountPlural');
	export const commandMutesDescription = T<string>('commandMutesDescription');
	export const commandMutesExtended = T<LanguageHelpDisplayOptions>('commandMutesExtended');
	export const commandWarningsDescription = T<string>('commandWarningsDescription');
	export const commandWarningsExtended = T<LanguageHelpDisplayOptions>('commandWarningsExtended');
	export const commandPermissions = T<(params: { username: string; id: string }) => string>('commandPermissions');
	export const commandPermissionsAll = T<string>('commandPermissionsAll');
	export const commandRaidDisabled = T<string>('commandRaidDisabled');
	export const commandRaidMissingKick = T<string>('commandRaidMissingKick');
	export const commandRaidList = T<string>('commandRaidList');
	export const commandRaidClear = T<string>('commandRaidClear');
	export const commandRaidCool = T<string>('commandRaidCool');
	export const commandFlow = T<(params: { amount: number }) => string>('commandFlow');
	export const commandTimeTimed = T<string>('commandTimeTimed');
	export const commandTimeUndefinedTime = T<string>('commandTimeUndefinedTime');
	export const commandTimeUnsupportedTipe = T<string>('commandTimeUnsupportedTipe');
	export const commandTimeNotScheduled = T<string>('commandTimeNotScheduled');
	export const commandTimeAborted = T<(params: { title: string }) => string>('commandTimeAborted');
	export const commandTimeScheduled = T<(params: { title: string; user: User; time: number }) => string>('commandTimeScheduled');
	export const commandSlowmodeSet = T<(params: { cooldown: number }) => string>('commandSlowmodeSet');
	export const commandSlowmodeReset = T<string>('commandSlowmodeReset');
	export const commandSlowmodeTooLong = T<string>('commandSlowmodeTooLong');
	export const commandBanNotBannable = T<string>('commandBanNotBannable');
	export const commandDehoistStarting = T<(params: { count: number }) => string>('commandDehoistStarting');
	export const commandDehoistProgress = T<(params: { count: number; percentage: number }) => string>('commandDehoistProgress');
	export const commandDehoistEmbed = T<
		(params: {
			users: number;
			dehoistedMemberCount: number;
			dehoistedWithErrorsCount: number;
			errored: number;
		}) => {
			title: string;
			descriptionNoone: string;
			descriptionWithError: string;
			descriptionWithMultipleErrors: string;
			description: string;
			descriptionMultipleMembers: string;
			fieldErrorTitle: string;
		}
	>('commandDehoistEmbed');
	export const commandKickNotKickable = T<string>('commandKickNotKickable');
	export const commandLockdownLock = T<(params: { channel: string }) => string>('commandLockdownLock');
	export const commandLockdownLocking = T<(params: { channel: string }) => string>('commandLockdownLocking');
	export const commandLockdownLocked = T<(params: { channel: string }) => string>('commandLockdownLocked');
	export const commandLockdownUnlocked = T<(params: { channel: string }) => string>('commandLockdownUnlocked');
	export const commandLockdownOpen = T<(params: { channel: string }) => string>('commandLockdownOpen');
	export const commandMuteLowlevel = T<string>('commandMuteLowlevel');
	export const commandMuteConfigureCancelled = T<string>('commandMuteConfigureCancelled');
	export const commandMuteConfigure = T<string>('commandMuteConfigure');
	export const commandMuteConfigureToomanyRoles = T<string>('commandMuteConfigureToomanyRoles');
	export const commandMuteMuted = T<string>('commandMuteMuted');
	export const commandMuteUserNotMuted = T<string>('commandMuteUserNotMuted');
	export const commandMuteUnconfigured = T<string>('commandMuteUnconfigured');
	export const commandMutecreateMissingPermission = T<string>('commandMutecreateMissingPermission');
	export const commandRestrictLowlevel = T<string>('commandRestrictLowlevel');
	export const commandPruneInvalid = T<string>('commandPruneInvalid');
	export const commandPruneAlert = T<(params: { count: number; total: number }) => string>('commandPruneAlert');
	export const commandPruneAlertPlural = T<(params: { count: number; total: number }) => string>('commandPruneAlertPlural');
	export const commandPruneInvalidPosition = T<string>('commandPruneInvalidPosition');
	export const commandPruneInvalidFilter = T<string>('commandPruneInvalidFilter');
	export const commandPruneNoDeletes = T<string>('commandPruneNoDeletes');
	export const commandPruneLogHeader = T<string>('commandPruneLogHeader');
	export const commandPruneLogMessage = T<(params: { channel: string; author: string; count: number }) => string>('commandPruneLogMessage');
	export const commandPruneLogMessagePlural = T<(params: { channel: string; author: string; count: number }) => string>(
		'commandPruneLogMessagePlural'
	);
	export const commandReasonMissingCase = T<string>('commandReasonMissingCase');
	export const commandReasonNotExists = T<string>('commandReasonNotExists');
	export const commandReasonUpdated = T<(params: { entries: readonly number[]; newReason: string; count: number }) => string[]>(
		'commandReasonUpdated'
	);
	export const commandReasonUpdatedPlural = T<(params: { entries: readonly number[]; newReason: string; count: number }) => string[]>(
		'commandReasonUpdatedPlural'
	);
	export const commandToggleModerationDmToggledEnabled = T<string>('commandToggleModerationDmToggledEnabled');
	export const commandToggleModerationDmToggledDisabled = T<string>('commandToggleModerationDmToggledDisabled');
	export const commandUnbanMissingPermission = T<string>('commandUnbanMissingPermission');
	export const commandUnmuteMissingPermission = T<string>('commandUnmuteMissingPermission');
	export const commandVmuteMissingPermission = T<string>('commandVmuteMissingPermission');
	export const commandVmuteUserNotMuted = T<string>('commandVmuteUserNotMuted');
	export const commandWarnDm = T<(params: { moderator: string; guild: string; reason: string }) => string>('commandWarnDm');
	export const commandWarnMessage = T<(params: { user: User; log: number }) => string>('commandWarnMessage');
	export const commandModerationOutput = T<(params: { count: number; range: string | number; users: string; reason: string | null }) => string>(
		'commandModerationOutput'
	);
	export const commandModerationOutputPlural = T<
		(params: { count: number; range: string | number; users: string; reason: string | null }) => string
	>('commandModerationOutputPlural');
	export const commandModerationOutputWithReason = T<
		(params: { count: number; range: string | number; users: string; reason: string | null }) => string
	>('commandModerationOutputWithReason');
	export const commandModerationOutputWithReasonPlural = T<
		(params: { count: number; range: string | number; users: string; reason: string | null }) => string
	>('commandModerationOutputWithReasonPlural');
	export const commandModerationFailed = T<(params: { users: string; count: number }) => string>('commandModerationFailed');
	export const commandModerationFailedPlural = T<(params: { users: string; count: number }) => string>('commandModerationFailedPlural');
	export const commandModerationDmFooter = T<string>('commandModerationDmFooter');
	export const commandModerationDmDescription = T<
		(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
	>('commandModerationDmDescription');
	export const commandModerationDmDescriptionWithReason = T<
		(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
	>('commandModerationDmDescriptionWithReason');
	export const commandModerationDmDescriptionWithDuration = T<
		(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
	>('commandModerationDmDescriptionWithDuration');
	export const commandModerationDmDescriptionWithReasonWithDuratio = T<
		(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
	>('commandModerationDmDescriptionWithReasonWithDuration');
	export const commandModerationDays = T<string>('commandModerationDays');
	export const commandAutoRolePointsRequired = T<string>('commandAutoRolePointsRequired');
	export const commandAutoRoleUpdateConfigured = T<string>('commandAutoRoleUpdateConfigured');
	export const commandAutoRoleUpdateUnconfigured = T<string>('commandAutoRoleUpdateUnconfigured');
	export const commandAutoRoleUpdate = T<(params: { role: Role; points: number; before: number }) => string>('commandAutoRoleUpdate');
	export const commandAutoRoleRemove = T<(params: { role: Role; before: number }) => string>('commandAutoRoleRemove');
	export const commandAutoRoleAdd = T<(params: { role: Role; points: number }) => string>('commandAutoRoleAdd');
	export const commandAutoRoleListEmpty = T<string>('commandAutoRoleListEmpty');
	export const commandAutoRoleUnknownRole = T<(params: { role: string }) => string>('commandAutoRoleUnknownRole');
	export const commandBalance = T<(params: { user: string; amount: string }) => string>('commandBalance');
	export const commandBalanceSelf = T<(params: { amount: string }) => string>('commandBalanceSelf');
	export const commandBalanceBots = T<string>('commandBalanceBots');
	export const commandSocialMemberNotexists = T<string>('commandSocialMemberNotexists');
	export const commandSocialAdd = T<(params: { user: string; amount: number; count: number }) => string>('commandSocialAdd');
	export const commandSocialAddPlural = T<(params: { user: string; amount: number; count: number }) => string>('commandSocialAddPlural');
	export const commandSocialRemove = T<(params: { user: string; amount: number; count: number }) => string>('commandSocialRemove');
	export const commandSocialRemovePlural = T<(params: { user: string; amount: number; count: number }) => string>('commandSocialRemovePlural');
	export const commandSocialUnchanged = T<(params: { user: string }) => string>('commandSocialUnchanged');
	export const commandSocialReset = T<(params: { user: string }) => string>('commandSocialReset');
	export const commandBannerMissing = T<(params: { type: string }) => string>('commandBannerMissing');
	export const commandBannerNotexists = T<(params: { prefix: string }) => string>('commandBannerNotexists');
	export const commandBannerUserlistEmpty = T<(params: { prefix: string }) => string>('commandBannerUserlistEmpty');
	export const commandBannerResetDefault = T<string>('commandBannerResetDefault');
	export const commandBannerReset = T<string>('commandBannerReset');
	export const commandBannerSetNotBought = T<string>('commandBannerSetNotBought');
	export const commandBannerSet = T<(params: { banner: string }) => string>('commandBannerSet');
	export const commandBannerBought = T<(params: { prefix: string; banner: string }) => string>('commandBannerBought');
	export const commandBannerMoney = T<(params: { money: number; cost: number }) => string>('commandBannerMoney');
	export const commandBannerPaymentCancelled = T<string>('commandBannerPaymentCancelled');
	export const commandBannerBuy = T<(params: { banner: string }) => string>('commandBannerBuy');
	export const commandBannerPrompt = T<string>('commandBannerPrompt');
	export const commandToggleDarkModeEnabled = T<string>('commandToggleDarkModeEnabled');
	export const commandToggleDarkModeDisabled = T<string>('commandToggleDarkModeDisabled');
	export const commandDailyTime = T<(params: { time: number }) => string>('commandDailyTime');
	export const commandDailyTimeSuccess = T<(params: { amount: number }) => string>('commandDailyTimeSuccess');
	export const commandDailyGrace = T<(params: { remaining: number }) => string[]>('commandDailyGrace');
	export const commandDailyGraceAccepted = T<(params: { amount: number; remaining: number }) => string>('commandDailyGraceAccepted');
	export const commandDailyGraceDenied = T<string>('commandDailyGraceDenied');
	export const commandDailyCollect = T<string>('commandDailyCollect');
	export const commandLevel = T<LevelTitles>('commandLevel');
	export const commandDivorceNotTaken = T<string>('commandDivorceNotTaken');
	export const commandDivorcePrompt = T<string>('commandDivorcePrompt');
	export const commandDivorceCancel = T<string>('commandDivorceCancel');
	export const commandDivorceDm = T<(params: { user: string }) => string>('commandDivorceDm');
	export const commandDivorceSuccess = T<(params: { user: string }) => string>('commandDivorceSuccess');
	export const commandMarryWith = T<(params: { users: readonly string[] }) => string>('commandMarryWith');
	export const commandMarryNotTaken = T<string>('commandMarryNotTaken');
	export const commandMarrySkyra = T<string>('commandMarrySkyra');
	export const commandMarrySneyra = T<string>('commandMarrySneyra');
	export const commandMarryBots = T<string>('commandMarryBots');
	export const commandMarrySelf = T<string>('commandMarrySelf');
	export const commandMarryAuthorTaken = T<(params: { author: User }) => string>('commandMarryAuthorTaken');
	export const commandMarryAuthorMultipleCancel = T<(params: { user: string }) => string>('commandMarryAuthorMultipleCancel');
	export const commandMarryTaken = T<(params: { count: number }) => string>('commandMarryTaken');
	export const commandMarryTakenPlural = T<(params: { count: number }) => string>('commandMarryTakenPlural');
	export const commandMarryAlreadyMarried = T<(params: { user: User }) => string>('commandMarryAlreadyMarried');
	export const commandMarryAuthorTooMany = T<(params: { limit: number }) => string>('commandMarryAuthorTooMany');
	export const commandMarryTargetTooMany = T<(params: { limit: number }) => string>('commandMarryTargetTooMany');
	export const commandMarryMultipleCancel = T<string>('commandMarryMultipleCancel');
	export const commandMarryPetition = T<(params: { author: User; user: User }) => string>('commandMarryPetition');
	export const commandMarryNoreply = T<string>('commandMarryNoreply');
	export const commandMarryDenied = T<string>('commandMarryDenied');
	export const commandMarryAccepted = T<(params: { author: User; user: User }) => string>('commandMarryAccepted');
	export const commandMylevel = T<(params: { points: number; next: string; user: string }) => string>('commandMylevel');
	export const commandMylevelSelf = T<(params: { points: number; next: string }) => string>('commandMylevelSelf');
	export const commandMylevelNext = T<(params: { remaining: number; next: number }) => string>('commandMylevelNext');
	export const commandPayMissingMoney = T<(params: { needed: number; has: number }) => string>('commandPayMissingMoney');
	export const commandPayPrompt = T<(params: { user: string; amount: number }) => string>('commandPayPrompt');
	export const commandPayPromptAccept = T<(params: { user: string; amount: number }) => string>('commandPayPromptAccept');
	export const commandPayPromptDeny = T<string>('commandPayPromptDeny');
	export const commandPaySelf = T<string>('commandPaySelf');
	export const commandSocialPayBot = T<string>('commandSocialPayBot');
	export const commandProfile = T<ProfileTitles>('commandProfile');
	export const commandRemindmeCreate = T<(params: { id: string }) => string>('commandRemindmeCreate');
	export const commandRemindmeCreateNoDuration = T<string>('commandRemindmeCreateNoDuration');
	export const commandRemindmeCreateNoDescription = T<string>('commandRemindmeCreateNoDescription');
	export const commandRemindmeDeleteNoId = T<string>('commandRemindmeDeleteNoId');
	export const commandRemindmeDelete = T<(params: { task: ScheduleEntity; id: number }) => string>('commandRemindmeDelete');
	export const commandRemindmeListEmpty = T<string>('commandRemindmeListEmpty');
	export const commandRemindmeShowFooter = T<(params: { id: number }) => string>('commandRemindmeShowFooter');
	export const commandRemindmeInvalidId = T<string>('commandRemindmeInvalidId');
	export const commandRemindmeNotfound = T<string>('commandRemindmeNotfound');
	export const commandReputationTime = T<(params: { remaining: number }) => string>('commandReputationTime');
	export const commandReputationUsable = T<string>('commandReputationUsable');
	export const commandReputationUserNotfound = T<string>('commandReputationUserNotfound');
	export const commandReputationSelf = T<string>('commandReputationSelf');
	export const commandReputationBots = T<string>('commandReputationBots');
	export const commandReputationGive = T<(params: { user: string }) => string>('commandReputationGive');
	export const commandReputationsBots = T<string>('commandReputationsBots');
	export const commandReputationsSelf = T<(params: { points: number }) => string>('commandReputationsSelf');
	export const commandReputation = T<(params: { count: number }) => string>('commandReputation');
	export const commandReputationPlural = T<(params: { count: number }) => string>('commandReputationPlural');
	export const commandReputations = T<(params: { user: string; points: string }) => string>('commandReputations');
	export const commandRequireRole = T<string>('commandRequireRole');
	export const commandScoreboardPosition = T<(params: { position: number }) => string>('commandScoreboardPosition');
	export const commandSetColor = T<(params: { color: string }) => string>('commandSetColor');
	export const commandSuggestNoSetup = T<(params: { username: string }) => string>('commandSuggestNoSetup');
	export const commandSuggestNoSetupAsk = T<(params: { username: string }) => string>('commandSuggestNoSetupAsk');
	export const commandSuggestNoSetupAbort = T<string>('commandSuggestNoSetupAbort');
	export const commandSuggestNopermissions = T<(params: { username: string; channel: string }) => string>('commandSuggestNopermissions');
	export const commandSuggestChannelPrompt = T<string>('commandSuggestChannelPrompt');
	export const commandSuggestTitle = T<(params: { id: number }) => string>('commandSuggestTitle');
	export const commandSuggestSuccess = T<(params: { channel: string }) => string>('commandSuggestSuccess');
	export const commandResolveSuggestionInvalidId = T<string>('commandResolveSuggestionInvalidId');
	export const commandResolveSuggestionMessageNotFound = T<string>('commandResolveSuggestionMessageNotFound');
	export const commandResolveSuggestionIdNotFound = T<string>('commandResolveSuggestionIdNotFound');
	export const commandResolveSuggestionDefaultComment = T<string>('commandResolveSuggestionDefaultComment');
	export const commandResolveSuggestionAuthorAdmin = T<string>('commandResolveSuggestionAuthorAdmin');
	export const commandResolveSuggestionAuthorModerator = T<string>('commandResolveSuggestionAuthorModerator');
	export const commandResolveSuggestionActions = T<
		(params: {
			author: string;
		}) => {
			accept: string;
			consider: string;
			deny: string;
		}
	>('commandResolveSuggestionActions');
	export const commandResolveSuggestionActionsDms = T<
		(params: {
			author: string;
			guild: string;
		}) => {
			accept: string;
			consider: string;
			deny: string;
		}
	>('commandResolveSuggestionActionsDms');
	export const commandResolveSuggestionDmFail = T<string>('commandResolveSuggestionDmFail');
	export const commandResolveSuggestionSuccess = T<(params: { id: number; actionText: string }) => string>('commandResolveSuggestionSuccess');
	export const commandResolveSuggestionSuccessAcceptedText = T<string>('commandResolveSuggestionSuccessAcceptedText');
	export const commandResolveSuggestionSuccessDeniedText = T<string>('commandResolveSuggestionSuccessDeniedText');
	export const commandResolveSuggestionSuccessConsideredText = T<string>('commandResolveSuggestionSuccessConsideredText');
	export const commandStarNostars = T<string>('commandStarNostars');
	export const commandStarStats = T<string>('commandStarStats');
	export const commandStarStatsDescription = T<(params: { messages: string; stars: string }) => string>('commandStarStatsDescription');
	export const commandStarMessages = T<(params: { count: number }) => string>('commandStarMessages');
	export const commandStarMessagesPlural = T<(params: { count: number }) => string>('commandStarMessagesPlural');
	export const commandStars = T<(params: { count: number }) => string>('commandStars');
	export const commandStarsPlural = T<(params: { count: number }) => string>('commandStarsPlural');
	export const commandStarTopstarred = T<string>('commandStarTopstarred');
	export const commandStarTopstarredDescription = T<(params: { medal: string; id: string; count: number }) => string>(
		'commandStarTopstarredDescription'
	);
	export const commandStarTopstarredDescriptionPlural = T<(params: { medal: string; id: string; count: number }) => string>(
		'commandStarTopstarredDescriptionPlural'
	);
	export const commandStarTopreceivers = T<string>('commandStarTopreceivers');
	export const commandStarTopreceiversDescription = T<(params: { medal: string; id: string; count: number }) => string>(
		'commandStarTopreceiversDescription'
	);
	export const commandStarTopreceiversDescriptionPlural = T<(params: { medal: string; id: string; count: number }) => string>(
		'commandStarTopreceiversDescriptionPlural'
	);
	export const commandEvalTimeout = T<(params: { seconds: number }) => string>('commandEvalTimeout');
	export const commandEvalError = T<(params: { time: string; output: string; type: string }) => string>('commandEvalError');
	export const commandStatsTitles = T<{
		stats: string;
		uptime: string;
		serverUsage: string;
	}>('commandStatsTitles');
	export const commandStatsFields = T<
		(params: {
			stats: StatsGeneral;
			uptime: StatsUptime;
			usage: StatsUsage;
		}) => {
			stats: string[];
			uptime: string[];
			serverUsage: string[];
		}
	>('commandStatsFields');
	export const commandTagDescription = T<string>('commandTagDescription');
	export const commandTagExtended = T<LanguageHelpDisplayOptions>('commandTagExtended');
	export const commandTagPermissionlevel = T<string>('commandTagPermissionlevel');
	export const commandTagNameNotAllowed = T<string>('commandTagNameNotAllowed');
	export const commandTagNameTooLong = T<string>('commandTagNameTooLong');
	export const commandTagListEmpty = T<string>('commandTagListEmpty');
	export const commandTagContentRequired = T<string>('commandTagContentRequired');
	export const commandTagExists = T<(params: { tag: string }) => string>('commandTagExists');
	export const commandTagAdded = T<(params: { name: string; content: string }) => string>('commandTagAdded');
	export const commandTagRemoved = T<(params: { name: string }) => string>('commandTagRemoved');
	export const commandTagNotexists = T<(params: { tag: string }) => string>('commandTagNotexists');
	export const commandTagEdited = T<(params: { name: string; content: string }) => string>('commandTagEdited');
	export const commandTagReset = T<string>('commandTagReset');
	export const commandAvatarNone = T<string>('commandAvatarNone');
	export const commandColor = T<(params: { hex: string; rgb: string; hsl: string }) => string[]>('commandColor');
	export const commandEmojiCustom = T<(params: { emoji: string; id: string }) => string[]>('commandEmojiCustom');
	export const commandEmojiTwemoji = T<(params: { emoji: string; id: string }) => string[]>('commandEmojiTwemoji');
	export const commandEmojiInvalid = T<string>('commandEmojiInvalid');
	export const commandEmojiTooLarge = T<(params: { emoji: string }) => string>('commandEmojiTooLarge');
	export const commandEmotesDescription = T<string>('commandEmotesDescription');
	export const commandEmotesExtended = T<LanguageHelpDisplayOptions>('commandEmotesExtended');
	export const commandEmotesTitle = T<string>('commandEmotesTitle');
	export const commandPriceCurrency = T<(params: { fromCurrency: string; fromAmount: number; worths: string[] }) => string>('commandPriceCurrency');
	export const commandPriceCurrencyNotFound = T<string>('commandPriceCurrencyNotFound');
	export const commandQuoteMessage = T<string>('commandQuoteMessage');
	export const commandRolesListEmpty = T<string>('commandRolesListEmpty');
	export const commandRolesAbort = T<(params: { prefix: string }) => string>('commandRolesAbort');
	export const commandRolesListTitle = T<string>('commandRolesListTitle');
	export const commandRolesAdded = T<(params: { roles: string }) => string>('commandRolesAdded');
	export const commandRolesRemoved = T<(params: { roles: string }) => string>('commandRolesRemoved');
	export const commandRolesNotPublic = T<(params: { roles: string }) => string>('commandRolesNotPublic');
	export const commandRolesNotManageable = T<(params: { roles: string }) => string>('commandRolesNotManageable');
	export const commandRolesAuditlog = T<string>('commandRolesAuditlog');
	export const commandDuckDuckGoNotfound = T<string>('commandDuckDuckGoNotfound');
	export const commandDuckDuckGoLookalso = T<string>('commandDuckDuckGoLookalso');
	export const commandUrbanNotFound = T<string>('commandUrbanNotFound');
	export const commandUrbanIndexNotfound = T<string>('commandUrbanIndexNotfound');
	export const systemTextTruncated = T<(params: { definition: string; url: string }) => string>('systemTextTruncated');
	export const commandWhoisMemberTitles = T<{
		joined: string;
		createdAt: string;
	}>('commandWhoisMemberTitles');
	export const commandWhoisMemberFields = T<
		(params: {
			member: GuildMember;
		}) => {
			joinedUnknown: string;
			joinedWithTimestamp: string;
			createdAt: string;
			footer: string;
		}
	>('commandWhoisMemberFields');
	export const commandWhoisMemberRoles = T<(params: { count: number }) => string>('commandWhoisMemberRoles');
	export const commandWhoisMemberRolesPlural = T<(params: { count: number }) => string>('commandWhoisMemberRolesPlural');
	export const commandWhoisMemberPermissions = T<string>('commandWhoisMemberPermissions');
	export const commandWhoisMemberPermissionsAll = T<string>('commandWhoisMemberPermissionsAll');
	export const commandWhoisUserTitles = T<{
		createdAt: string;
	}>('commandWhoisUserTitles');
	export const commandWhoisUserFields = T<
		(params: {
			user: User;
		}) => {
			createdAt: string;
			footer: string;
		}
	>('commandWhoisUserFields');
	export const commandFollowage = T<(params: { user: string; channel: string; time: number }) => string>('comm');
	export const commandFollowageMissingEntries = T<string>('commandFollowageMissingEntries');
	export const commandFollowageNotFollowing = T<string>('commandFollowageNotFollowing');
	export const commandTwitchNoEntries = T<string>('commandTwitchNoEntries');
	export const commandTwitchTitles = T<{
		followers: string;
		views: string;
		clickToVisit: string;
		partner: string;
	}>('commandTwitchTitles');
	export const commandTwitchPartnershipWithoutAffiliate = T<string>('commandTwitchPartnershipWithoutAffiliate');
	export const commandTwitchAffiliateStatus = T<{
		affiliated: string;
		partnered: string;
	}>('commandTwitchAffiliateStatus');
	export const commandTwitchCreatedAt = T<string>('commandTwitchCreatedAt');
	export const commandTwitchSubscriptionRequiredStreamer = T<string>('commandTwitchSubscriptionRequiredStreamer');
	export const commandTwitchSubscriptionStreamerNotFound = T<string>('commandTwitchSubscriptionStreamerNotFound');
	export const commandTwitchSubscriptionRequiredChannel = T<string>('commandTwitchSubscriptionRequiredChannel');
	export const commandTwitchSubscriptionRequiredStatus = T<string>('commandTwitchSubscriptionRequiredStatus');
	export const commandTwitchSubscriptionStatusValues = T<[string, string]>('commandTwitchSubscriptionStatusValues');
	export const commandTwitchSubscriptionInvalidStatus = T<string>('commandTwitchSubscriptionInvalidStatus');
	export const commandTwitchSubscriptionRequiredContent = T<string>('commandTwitchSubscriptionRequiredContent');
	export const commandTwitchSubscriptionAddDuplicated = T<string>('commandTwitchSubscriptionAddDuplicated');
	export const commandTwitchSubscriptionAddSuccessOffline = T<(params: { name: string; channel: string }) => string>(
		'commandTwitchSubscriptionAddSuccessOffline'
	);
	export const commandTwitchSubscriptionAddSuccessLive = T<(params: { name: string; channel: string }) => string>(
		'commandTwitchSubscriptionAddSuccessLive'
	);
	export const commandTwitchSubscriptionRemoveStreamerNotSubscribed = T<string>('commandTwitchSubscriptionRemoveStreamerNotSubscribed');
	export const commandTwitchSubscriptionRemoveEntryNotExists = T<string>('commandTwitchSubscriptionRemoveEntryNotExists');
	export const commandTwitchSubscriptionRemoveSuccessOffline = T<(params: { name: string; channel: string }) => string>(
		'commandTwitchSubscriptionRemoveSuccessOffline'
	);
	export const commandTwitchSubscriptionRemoveSuccessLive = T<(params: { name: string; channel: string }) => string>(
		'commandTwitchSubscriptionRemoveSuccessLive'
	);
	export const commandTwitchSubscriptionResetEmpty = T<string>('commandTwitchSubscriptionResetEmpty');
	export const commandTwitchSubscriptionResetSuccess = T<(params: { count: number }) => string>('commandTwitchSubscriptionResetSuccess');
	export const commandTwitchSubscriptionResetSuccessPlural = T<(params: { count: number }) => string>(
		'commandTwitchSubscriptionResetSuccessPlural'
	);
	export const commandTwitchSubscriptionResetStreamerNotSubscribed = T<string>('commandTwitchSubscriptionResetStreamerNotSubscribed');
	export const commandTwitchSubscriptionResetChannelSuccess = T<(params: { name: string; count: number }) => string>(
		'commandTwitchSubscriptionResetChannelSuccess'
	);
	export const commandTwitchSubscriptionResetChannelSuccessPlural = T<(params: { name: string; count: number }) => string>(
		'commandTwitchSubscriptionResetChannelSuccessPlural'
	);
	export const commandTwitchSubscriptionShowStreamerNotSubscribed = T<string>('commandTwitchSubscriptionShowStreamerNotSubscribed');
	export const commandTwitchSubscriptionShowStatus = T<[string, string]>('commandTwitchSubscriptionShowStatus');
	export const commandTwitchSubscriptionShowEmpty = T<string>('commandTwitchSubscriptionShowEmpty');
	export const commandTwitchSubscriptionShowUnknownUser = T<string>('commandTwitchSubscriptionShowUnknownUser');
	export const commandWikipediaNotfound = T<string>('commandWikipediaNotfound');
	export const commandYoutubeNotfound = T<string>('commandYoutubeNotfound');
	export const commandYoutubeIndexNotfound = T<string>('commandYoutubeIndexNotfound');
	export const commandDefineDescription = T<string>('commandDefineDescription');
	export const commandDefineExtended = T<LanguageHelpDisplayOptions>('commandDefineExtended');
	export const commandDefineNotfound = T<string>('commandDefineNotfound');
	export const commandDefinePronounciation = T<string>('commandDefinePronounciation');
	export const commandDefineUnknown = T<string>('commandDefineUnknown');
	export const commandWbang = T<(params: { user: string }) => string>('commandWbang');
	export const commandWbanghead = T<string>('commandWbanghead');
	export const commandWbite = T<(params: { user: string }) => string>('commandWbite');
	export const commandWblush = T<string>('commandWblush');
	export const commandWcry = T<(params: { user: string }) => string>('commandWcry');
	export const commandWcuddle = T<(params: { user: string }) => string>('commandWcuddle');
	export const commandWdance = T<string>('commandWdance');
	export const commandWgreet = T<(params: { user: string }) => string>('commandWgreet');
	export const commandWhug = T<(params: { user: string }) => string>('commandWhug');
	export const commandWkiss = T<(params: { user: string }) => string>('commandWkiss');
	export const commandWlewd = T<string>('commandWlewd');
	export const commandWlick = T<(params: { user: string }) => string>('commandWlick');
	export const commandWnom = T<string>('commandWnom');
	export const commandWneko = T<string>('commandWneko');
	export const commandWpat = T<(params: { user: string }) => string>('commandWpat');
	export const commandWpout = T<string>('commandWpout');
	export const commandWpunch = T<(params: { user: string }) => string>('commandWpunch');
	export const commandWslap = T<(params: { user: string }) => string>('commandWslap');
	export const commandWsleepy = T<string>('commandWsleepy');
	export const commandWsmile = T<string>('commandWsmile');
	export const commandWsmug = T<string>('commandWsmug');
	export const commandWstare = T<(params: { user: string }) => string>('commandWstare');
	export const commandWthumbsup = T<string>('commandWthumbsup');
	export const commandWtickle = T<(params: { user: string }) => string>('commandWtickle');
	export const constMonitorInvitelink = T<string>('constMonitorInvitelink');
	export const constMonitorLink = T<string>('constMonitorLink');
	export const constMonitorNms = T<string>('constMonitorNms');
	export const constMonitorWordfilter = T<string>('constMonitorWordfilter');
	export const constMonitorCapsfilter = T<string>('constMonitorCapsfilter');
	export const constMonitorAttachmentfilter = T<string>('constMonitorAttachmentfilter');
	export const constMonitorReactionfilter = T<string>('constMonitorReactionfilter');
	export const moderationMonitorAttachments = T<string>('moderationMonitorAttachments');
	export const moderationMonitorAttachmentsWithMaximum = T<(params: { amount: number; maximum: number }) => string>(
		'moderationMonitorAttachmentsWithMaximum'
	);
	export const moderationMonitorCapitals = T<string>('moderationMonitorCapitals');
	export const moderationMonitorCapitalsWithMaximum = T<(params: { amount: number; maximum: number }) => string>(
		'moderationMonitorCapitalsWithMaximum'
	);
	export const moderationMonitorInvites = T<string>('moderationMonitorInvites');
	export const moderationMonitorInvitesWithMaximum = T<(params: { amount: number; maximum: number }) => string>(
		'moderationMonitorInvitesWithMaximum'
	);
	export const moderationMonitorLinks = T<string>('moderationMonitorLinks');
	export const moderationMonitorLinksWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorLinksWithMaximum');
	export const moderationMonitorMessages = T<string>('moderationMonitorMessages');
	export const moderationMonitorMessagesWithMaximum = T<(params: { amount: number; maximum: number }) => string>(
		'moderationMonitorMessagesWithMaximum'
	);
	export const moderationMonitorNewlines = T<string>('moderationMonitorNewlines');
	export const moderationMonitorNewlinesWithMaximum = T<(params: { amount: number; maximum: number }) => string>(
		'moderationMonitorNewlinesWithMaximum'
	);
	export const moderationMonitorWords = T<string>('moderationMonitorWords');
	export const moderationMonitorWordsWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorWordsWithMaximum');
	export const hgBloodbath = T<readonly string[]>('hgBloodbath');
	export const hgDay = T<readonly string[]>('hgDay');
	export const hgNight = T<readonly string[]>('hgNight');

	export const selfModerationCommandInvalidMissingAction = T<(params: { name: string }) => string>('selfModerationCommandInvalidMissingAction');
	export const selfModerationCommandInvalidMissingArguments = T<(params: { name: string }) => string>(
		'selfModerationCommandInvalidMissingArguments'
	);
	export const selfModerationCommandInvalidSoftaction = T<(params: { name: string }) => string>('selfModerationCommandInvalidSoftaction');
	export const selfModerationCommandInvalidHardaction = T<(params: { name: string }) => string>('selfModerationCommandInvalidHardaction');
	export const selfModerationCommandEnabled = T<string>('selfModerationCommandEnabled');
	export const selfModerationCommandDisabled = T<string>('selfModerationCommandDisabled');
	export const selfModerationCommandSoftAction = T<string>('selfModerationCommandSoftAction');
	export const selfModerationCommandSoftActionWithValue = T<(params: { value: string }) => string>('selfModerationCommandSoftActionWithValue');
	export const selfModerationCommandHardAction = T<(params: { value: string }) => string>('selfModerationCommandHardAction');
	export const selfModerationCommandHardActionDuration = T<string>('selfModerationCommandHardActionDuration');
	export const selfModerationCommandHardActionDurationWithValue = T<(params: { value: number }) => string>(
		'selfModerationCommandHardActionDurationWithValue'
	);
	export const selfModerationCommandThresholdMaximum = T<string>('selfModerationCommandThresholdMaximum');
	export const selfModerationCommandThresholdMaximumWithValue = T<(params: { value: number }) => string>(
		'selfModerationCommandThresholdMaximumWithValue'
	);
	export const selfModerationCommandThresholdDuration = T<string>('selfModerationCommandThresholdDuration');
	export const selfModerationCommandThresholdDurationWithValue = T<(params: { value: number }) => string>(
		'selfModerationCommandThresholdDurationWithValue'
	);
	export const selfModerationCommandShow = T<
		(params: {
			kEnabled: string;
			kAlert: string;
			kLog: string;
			kDelete: string;
			kHardAction: string;
			hardActionDurationText: string;
			thresholdMaximumText: string | number;
			thresholdDurationText: string;
		}) => readonly string[]
	>('selfModerationCommandShow');
	export const selfModerationCommandShowDurationPermanent = T<string>('selfModerationCommandShowDurationPermanent');
	export const selfModerationCommandShowUnset = T<string>('selfModerationCommandShowUnset');
	export const selfModerationSoftActionAlert = T<string>('selfModerationSoftActionAlert');
	export const selfModerationSoftActionLog = T<string>('selfModerationSoftActionLog');
	export const selfModerationSoftActionDelete = T<string>('selfModerationSoftActionDelete');
	export const selfModerationHardActionBan = T<string>('selfModerationHardActionBan');
	export const selfModerationHardActionKick = T<string>('selfModerationHardActionKick');
	export const selfModerationHardActionMute = T<string>('selfModerationHardActionMute');
	export const selfModerationHardActionSoftban = T<string>('selfModerationHardActionSoftban');
	export const selfModerationHardActionWarning = T<string>('selfModerationHardActionWarning');
	export const selfModerationHardActionNone = T<string>('selfModerationHardActionNone');
	export const selfModerationEnabled = T<string>('selfModerationEnabled');
	export const selfModerationDisabled = T<string>('selfModerationDisabled');
	export const selfModerationMaximumTooShort = T<(params: { minimum: number; value: number }) => string>('selfModerationMaximumTooShort');
	export const selfModerationMaximumTooLong = T<(params: { maximum: number; value: number }) => string>('selfModerationMaximumTooLong');
	export const selfModerationDurationTooShort = T<(params: { minimum: number; value: number }) => string>('selfModerationDurationTooShort');
	export const selfModerationDurationTooLong = T<(params: { maximum: number; value: number }) => string>('selfModerationDurationTooLong');
	export const moderationActions = T<ModerationAction>('moderationActions');
	export const actionApplyReason = T<(params: { action: string; reason: string }) => string>('actionApplyReason');
	export const actionApplyNoReason = T<(params: { action: string }) => string>('actionApplyNoReason');
	export const actionRevokeReason = T<(params: { action: string; reason: string }) => string>('actionRevokeReason');
	export const actionRevokeNoReason = T<(params: { action: string }) => string>('actionRevokeNoReason');
	export const actionSoftbanReason = T<(params: { reason: string }) => string>('actionSoftbanReason');
	export const actionUnSoftbanReason = T<(params: { reason: string }) => string>('actionUnSoftbanReason');
	export const actionSoftbanNoReason = T<string>('actionSoftbanNoReason');
	export const actionUnSoftbanNoReason = T<string>('actionUnSoftbanNoReason');
	export const actionSetNicknameSet = T<(params: { reason: string }) => string>('actionSetNicknameSet');
	export const actionSetNicknameRemoved = T<(params: { reason: string }) => string>('actionSetNicknameRemoved');
	export const actionSetNicknameNoReasonSet = T<string>('actionSetNicknameNoReasonSet');
	export const actionSetNicknameNoReasonRemoved = T<string>('actionSetNicknameNoReasonRemoved');
	export const actionSetupMuteExists = T<string>('actionSetupMuteExists');
	export const actionSetupRestrictionExists = T<string>('actionSetupRestrictionExists');
	export const actionSetupTooManyRoles = T<string>('actionSetupTooManyRoles');
	export const actionSharedRoleSetupExisting = T<string>('actionSharedRoleSetupExisting');
	export const actionSharedRoleSetupExistingName = T<string>('actionSharedRoleSetupExistingName');
	export const actionSharedRoleSetupNew = T<string>('actionSharedRoleSetupNew');
	export const actionSharedRoleSetupAsk = T<(params: { role: string; channels: number; permissions: string }) => string>(
		'actionSharedRoleSetupAsk'
	);
	export const actionSharedRoleSetupAskMultipleChannels = T<(params: { role: string; channels: number; permissions: string }) => string>(
		'actionSharedRoleSetupAskMultipleChannels'
	);
	export const actionSharedRoleSetupAskMultiplePermissions = T<(params: { role: string; channels: number; permissions: string }) => string>(
		'actionSharedRoleSetupAskMultiplePermissions'
	);
	export const actionSharedRoleSetupAskMultipleChannelsMultiplePermissions = T<
		(params: { role: string; channels: number; permissions: string }) => string
	>('actionSharedRoleSetupAskMultipleChannelsMultiplePermissions');
	export const actionRequiredMember = T<string>('actionRequiredMember');
	export const muteNotConfigured = T<string>('muteNotConfigured');
	export const restrictionNotConfigured = T<string>('restrictionNotConfigured');
	export const muteNotInMember = T<string>('muteNotInMember');
	export const muteLowHierarchy = T<string>('muteLowHierarchy');
	export const muteCannotManageRoles = T<string>('muteCannotManageRoles');
	export const muteNotExists = T<string>('muteNotExists');
	export const resolverDateSuffix = T<string>('resolverDateSuffix');
	export const resolverPositiveAmount = T<string>('resolverPositiveAmount');
	export const prefixReminder = T<(params: { prefix: string }) => string>('prefixReminder');
	export const unexpectedIssue = T<string>('unexpectedIssue');
	export const commandDmNotSent = T<string>('commandDmNotSent');
	export const commandDmSent = T<string>('commandDmSent');
	export const commandRoleHigherSkyra = T<string>('commandRoleHigherSkyra');
	export const commandRoleHigher = T<string>('commandRoleHigher');
	export const commandSuccess = T<string>('commandSuccess');
	export const commandToskyra = T<string>('commandToskyra');
	export const commandUserself = T<string>('commandUserself');
	export const jumpTo = T<string>('jumpTo');
	export const resolverInvalidChannelName = T<(params: { name: string }) => string>('resolverInvalidChannelName');
	export const resolverChannelNotInGuild = T<string>('resolverChannelNotInGuild');
	export const resolverChannelNotInGuildSubcommand = T<(params: { command: string; subcommand: string }) => string>(
		'resolverChannelNotInGuildSubcommand'
	);
	export const resolverInvalidRoleName = T<(params: { name: string }) => string>('resolverInvalidRoleName');
	export const resolverInvalidUsername = T<(params: { name: string }) => string>('resolverInvalidUsername');
	export const resolverMembernameUserLeftDuringPrompt = T<string>('resolverMembernameUserLeftDuringPrompt');
	export const listifyPage = T<(params: { page: number; pageCount: number; results: string }) => string>('listifyPage');
	export const moderationLogAppealed = T<string>('moderationLogAppealed');
	export const moderationLogExpiresIn = T<(params: { duration: number }) => string>('moderationLogExpiresIn');
	export const moderationLogDescription = T<(params: { data: Moderation.ModerationManagerDescriptionData }) => string>('moderationLogDescription');
	export const moderationLogFooter = T<(params: { caseID: number }) => string>('moderationLogFooter');
	export const moderationCaseNotExists = T<string>('moderationCaseNotExists');
	export const moderationCasesNotExist = T<string>('moderationCasesNotExist');
	export const guildSettingsChannelsMod = T<string>('guildSettingsChannelsMod');
	export const guildSettingsRolesRestricted = T<(params: { prefix: string; path: string }) => string>('guildSettingsRolesRestricted');
	export const guildMuteNotFound = T<string>('guildMuteNotFound');
	export const guildBansEmpty = T<string>('guildBansEmpty');
	export const guildBansNotFound = T<string>('guildBansNotFound');
	export const channelNotReadable = T<string>('channelNotReadable');
	export const userNotInGuild = T<string>('userNotInGuild');
	export const userNotExistent = T<string>('userNotExistent');
	export const eventsGuildMemberAdd = T<string>('eventsGuildMemberAdd');
	export const eventsGuildMemberAddMute = T<string>('eventsGuildMemberAddMute');
	export const eventsGuildMemberAddRaid = T<string>('eventsGuildMemberAddRaid');
	export const eventsGuildMemberAddDescription = T<(params: { mention: string; time: number }) => string>('eventsGuildMemberAddDescription');
	export const eventsGuildMemberRemove = T<string>('eventsGuildMemberRemove');
	export const eventsGuildMemberKicked = T<string>('eventsGuildMemberKicked');
	export const eventsGuildMemberBanned = T<string>('eventsGuildMemberBanned');
	export const eventsGuildMemberSoftBanned = T<string>('eventsGuildMemberSoftBanned');
	export const eventsGuildMemberRemoveDescription = T<(params: { mention: string; time: number }) => string>('eventsGuildMemberRemoveDescription');
	export const eventsGuildMemberRemoveDescriptionWithJoinedAt = T<(params: { mention: string; time: number }) => string>(
		'eventsGuildMemberRemoveDescriptionWithJoinedAt'
	);
	export const eventsGuildMemberUpdateNickname = T<(params: { previous: string; current: string }) => string>('eventsGuildMemberUpdateNickname');
	export const eventsGuildMemberAddedNickname = T<(params: { previous: string; current: string }) => string>('eventsGuildMemberAddedNickname');
	export const eventsGuildMemberRemovedNickname = T<(params: { previous: string }) => string>('eventsGuildMemberRemovedNickname');
	export const eventsNicknameUpdate = T<string>('eventsNicknameUpdate');
	export const eventsUsernameUpdate = T<string>('eventsUsernameUpdate');
	export const eventsNameUpdatePreviousWasSet = T<(params: { previousName: string | null }) => string>('eventsNameUpdatePreviousWasSet');
	export const eventsNameUpdatePreviousWasNotSet = T<(params: { previousName: string | null }) => string>('eventsNameUpdatePreviousWasNotSet');
	export const eventsNameUpdateNextWasSet = T<(params: { nextName: string | null }) => string>('eventsNameUpdateNextWasSet');
	export const eventsNameUpdateNextWasNotSet = T<(params: { nextName: string | null }) => string>('eventsNameUpdateNextWasNotSet');
	export const eventsGuildMemberNoUpdate = T<string>('eventsGuildMemberNoUpdate');
	export const eventsGuildMemberAddedRoles = T<(params: { addedRoles: string }) => string>('eventsGuildMemberAddedRoles');
	export const eventsGuildMemberAddedRolesPlural = T<(params: { addedRoles: string }) => string>('eventsGuildMemberAddedRolesPlural');
	export const eventsGuildMemberRemovedRoles = T<(params: { removedRoles: string }) => string>('eventsGuildMemberRemovedRoles');
	export const eventsGuildMemberRemovedRolesPlural = T<(params: { removedRoles: string }) => string>('eventsGuildMemberRemovedRolesPlural');
	export const eventsRoleUpdate = T<string>('eventsRoleUpdate');
	export const eventsMessageUpdate = T<string>('eventsMessageUpdate');
	export const eventsMessageDelete = T<string>('eventsMessageDelete');
	export const eventsReaction = T<string>('eventsReaction');
	export const eventsCommand = T<(params: { command: string }) => string>('eventsCommand');
	export const settingsDeleteChannelsDefault = T<string>('settingsDeleteChannelsDefault');
	export const settingsDeleteRolesInitial = T<string>('settingsDeleteRolesInitial');
	export const settingsDeleteRolesMute = T<string>('settingsDeleteRolesMute');
	export const modlogTimed = T<(params: { remaining: number }) => string>('modlogTimed');
	export const guildWarnNotFound = T<string>('guildWarnNotFound');
	export const guildMemberNotVoicechannel = T<string>('guildMemberNotVoicechannel');
	export const promptlistMultipleChoice = T<(params: { list: string; count: number }) => string>('promptlistMultipleChoice');
	export const promptlistMultipleChoicePlural = T<(params: { list: string; count: number }) => string>('promptlistMultipleChoicePlural');
	export const promptlistAttemptFailed = T<(params: { list: string; attempt: number; maxAttempts: number }) => string>('promptlistAttemptFailed');
	export const promptlistAborted = T<string>('promptlistAborted');
	export const fuzzySearchMatches = T<(params: { matches: number; codeblock: string }) => string>('fuzzySearchMatches');
	export const fuzzySearchAborted = T<string>('fuzzySearchAborted');
	export const fuzzySearchInvalidNumber = T<string>('fuzzySearchInvalidNumber');
	export const fuzzySearchInvalidIndex = T<string>('fuzzySearchInvalidIndex');
	export const eventsErrorWtf = T<string>('eventsErrorWtf');
	export const eventsErrorString = T<(params: { mention: string; message: string }) => string>('eventsErrorString');
	export const constUsers = T<string>('constUsers');
	export const constMonitorMessagefilter = T<string>('constMonitorMessagefilter');
	export const constMonitorNewlinefilter = T<string>('constMonitorNewlinefilter');
	export const unknownChannel = T<string>('unknownChannel');
	export const unknownRole = T<string>('unknownRole');
	export const unknownUser = T<string>('unknownUser');
	export const notificationsTwitchNoGameName = T<string>('notificationsTwitchNoGameName');
	export const notificationsTwitchEmbedDescription = T<(params: { userName: string }) => string>('notificationsTwitchEmbedDescription');
	export const notificationsTwitchEmbedDescriptionWithGame = T<(params: { userName: string; gameName: string }) => string>(
		'notificationsTwitchEmbedDescriptionWithGame'
	);
	export const notificationTwitchEmbedFooter = T<string>('notificationTwitchEmbedFooter');
}
