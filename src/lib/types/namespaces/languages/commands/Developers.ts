import { FT, T } from '@lib/types';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const YarnDescription = T<string>('commandYarnDescription');
export const YarnEmbedDescriptionAuthor = FT<{ author: string }, string>('commandYarnEmbedDescriptionAuthor');
export const YarnEmbedDescriptionDateCreated = FT<{ dateCreated: string }, string>('commandYarnEmbedDescriptionDateCreated');
export const YarnEmbedDescriptionDateModified = FT<{ dateModified: string }, string>('commandYarnEmbedDescriptionDateModified');
export const YarnEmbedDescriptionDependenciesLabel = T<string>('commandYarnEmbedDescriptionDependenciesLabel');
export const YarnEmbedDescriptionDependenciesNoDeps = T<string>('commandYarnEmbedDescriptionDependenciesNoDeps');
export const YarnEmbedDescriptionDeprecated = FT<{ deprecated: string }, string>('commandYarnEmbedDescriptionDeprecated');
export const YarnEmbedDescriptionLatestVersion = FT<{ latestVersionNumber: string }, string>('commandYarnEmbedDescriptionLatestVersion');
export const YarnEmbedDescriptionLicense = FT<{ license: string }, string>('commandYarnEmbedDescriptionLicense');
export const YarnEmbedDescriptionMainFile = FT<{ mainFile: string }, string>('commandYarnEmbedDescriptionMainFile');
export const YarnEmbedDescriptionMaintainers = T<string>('commandYarnEmbedDescriptionMaintainers');
export const YarnEmbedMoreText = T<string>('commandYarnEmbedMoreText');
export const YarnExtended = T<LanguageHelpDisplayOptions>('commandYarnExtended');
export const YarnNoPackage = T<string>('commandYarnNoPackage');
export const YarnPackageNotFound = FT<{ pkg: string }, string>('commandYarnPackageNotFound');
export const YarnUnpublishedPackage = FT<{ pkg: string }, string>('commandYarnUnpublishedPackage');
