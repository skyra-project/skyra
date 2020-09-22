import { T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const YarnDescription = T<string>('commandYarnDescription');
export const YarnEmbedDescriptionAuthor = T<(params: { author: string }) => string>('commandYarnEmbedDescriptionAuthor');
export const YarnEmbedDescriptionDateCreated = T<(params: { dateCreated: string }) => string>('commandYarnEmbedDescriptionDateCreated');
export const YarnEmbedDescriptionDateModified = T<(params: { dateModified: string }) => string>('commandYarnEmbedDescriptionDateModified');
export const YarnEmbedDescriptionDependenciesLabel = T<string>('commandYarnEmbedDescriptionDependenciesLabel');
export const YarnEmbedDescriptionDependenciesNoDeps = T<string>('commandYarnEmbedDescriptionDependenciesNoDeps');
export const YarnEmbedDescriptionDeprecated = T<(params: { deprecated: string }) => string>('commandYarnEmbedDescriptionDeprecated');
export const YarnEmbedDescriptionLatestVersion = T<(params: { latestVersionNumber: string }) => string>('commandYarnEmbedDescriptionLatestVersion');
export const YarnEmbedDescriptionLicense = T<(params: { license: string }) => string>('commandYarnEmbedDescriptionLicense');
export const YarnEmbedDescriptionMainFile = T<(params: { mainFile: string }) => string>('commandYarnEmbedDescriptionMainFile');
export const YarnEmbedDescriptionMaintainers = T<string>('commandYarnEmbedDescriptionMaintainers');
export const YarnEmbedMoreText = T<string>('commandYarnEmbedMoreText');
export const YarnExtended = T<LanguageHelpDisplayOptions>('commandYarnExtended');
export const YarnNoPackage = T<string>('commandYarnNoPackage');
export const YarnPackageNotFound = T<(params: { pkg: string }) => string>('commandYarnPackageNotFound');
export const YarnUnpublishedPackage = T<(params: { pkg: string }) => string>('commandYarnUnpublishedPackage');
