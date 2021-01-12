import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const YarnDescription = T<string>('commands/developer:yarnDescription');
export const YarnEmbedDescriptionAuthor = FT<{ author: string }, string>('commands/developer:yarnEmbedDescriptionAuthor');
export const YarnEmbedDescriptionDateCreated = FT<{ dateCreated: string }, string>('commands/developer:yarnEmbedDescriptionDateCreated');
export const YarnEmbedDescriptionDateModified = FT<{ dateModified: string }, string>('commands/developer:yarnEmbedDescriptionDateModified');
export const YarnEmbedDescriptionDependenciesLabel = T<string>('commands/developer:yarnEmbedDescriptionDependenciesLabel');
export const YarnEmbedDescriptionDependenciesNoDeps = T<string>('commands/developer:yarnEmbedDescriptionDependenciesNoDeps');
export const YarnEmbedDescriptionDeprecated = FT<{ deprecated: string }, string>('commands/developer:yarnEmbedDescriptionDeprecated');
export const YarnEmbedDescriptionLatestVersion = FT<{ latestVersionNumber: string }, string>('commands/developer:yarnEmbedDescriptionLatestVersion');
export const YarnEmbedDescriptionLicense = FT<{ license: string }, string>('commands/developer:yarnEmbedDescriptionLicense');
export const YarnEmbedDescriptionMainFile = FT<{ mainFile: string }, string>('commands/developer:yarnEmbedDescriptionMainFile');
export const YarnEmbedDescriptionMaintainers = FT<{ maintainers: string[] }, string>('commands/developer:yarnEmbedDescriptionMaintainers');
export const YarnEmbedMoreText = T<string>('commands/developer:yarnEmbedMoreText');
export const YarnExtended = T<LanguageHelpDisplayOptions>('commands/developer:yarnExtended');
export const YarnNoPackage = T<string>('commands/developer:yarnNoPackage');
export const YarnPackageNotFound = FT<{ pkg: string }, string>('commands/developer:yarnPackageNotFound');
export const YarnUnpublishedPackage = FT<{ pkg: string }, string>('commands/developer:yarnUnpublishedPackage');
