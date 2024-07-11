import {
  IAgentContext,
  ICredentialPlugin,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IPluginMethodMap,
  IResolver,
  PresentationPayload,
} from '@veramo/core'
import { IPresentation, Optional, W3CVerifiableCredential, W3CVerifiablePresentation } from '@sphereon/ssi-types'
import { IPresentationDefinition, PEVersion, SelectResults } from '@sphereon/pex'
import { Format, InputDescriptorV1, InputDescriptorV2 } from '@sphereon/pex-models'
import { ICredentialManager } from '@sphereon/ssi-sdk.credential-manager'
import { CredentialRole, FindDigitalCredentialArgs } from '@sphereon/ssi-sdk.data-store'

export interface IPresentationExchange extends IPluginMethodMap {
  pexValidateDefinition(args: IDefinitionValidateArgs): Promise<boolean>

  pexDefinitionVersion(presentationDefinition: IPresentationDefinition): Promise<VersionDiscoveryResult>

  pexDefinitionFilterCredentials(args: IDefinitionCredentialFilterArgs, context: IRequiredContext): Promise<IPEXFilterResult>

  pexDefinitionFilterCredentialsPerInputDescriptor(
    args: IDefinitionCredentialFilterArgs,
    context: IRequiredContext,
  ): Promise<IPEXFilterResultWithInputDescriptor[]>
}

export interface IDefinitionValidateArgs {
  definition: IPresentationDefinition // The Presentation definition/
}

export interface IDefinitionCredentialFilterArgs {
  presentationDefinition: IPresentationDefinition
  credentialFilterOpts: {
    credentialRole: CredentialRole
    verifiableCredentials?: W3CVerifiableCredential[]
    filter?: FindDigitalCredentialArgs
  }
  holderDIDs?: (string | IIdentifier)[]
  limitDisclosureSignatureSuites?: string[]
  restrictToFormats?: Format
  restrictToDIDMethods?: string[]
}

export interface PEXOpts {
  defaultStore?: string
  defaultNamespace?: string
}

export interface IPEXOptions {
  // presentationVerifyCallback?: PresentationVerificationCallback
  definition?: IPresentationDefinition
  definitionId: string
}

export interface IPEXFilterResultWithInputDescriptor extends IPEXFilterResult {
  inputDescriptor: InputDescriptorV1 | InputDescriptorV2
}

export interface IPEXFilterResult {
  id: string
  selectResults: SelectResults
  filteredCredentials: W3CVerifiableCredential[]
}

export interface VersionDiscoveryResult {
  version?: PEVersion
  error?: string
}

export type IPEXPresentationSignCallback = (args: IPEXPresentationSignCallBackParams) => Promise<W3CVerifiablePresentation>

export interface IPEXPresentationSignCallBackParams {
  presentation: IPresentation | Optional<PresentationPayload, 'holder'>
  presentationDefinition: IPresentationDefinition
}

export type IRequiredContext = IAgentContext<IDataStoreORM & IResolver & IDIDManager & ICredentialPlugin & ICredentialManager>
