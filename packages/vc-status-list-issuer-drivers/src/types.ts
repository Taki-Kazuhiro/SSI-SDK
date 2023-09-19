import {
  IAddStatusListEntryArgs,
  IGetStatusListEntryByCredentialIdArgs,
  IGetStatusListEntryByIndexArgs,
  IStatusListEntryEntity,
  StatusListStore,
} from '@sphereon/ssi-sdk.data-store'
import { StatusList2021EntryCredentialStatus, StatusListDetails } from '@sphereon/ssi-sdk.vc-status-list'
import { OriginalVerifiableCredential, StatusListDriverType } from '@sphereon/ssi-types'
import {
  IAgentContext,
  ICredentialIssuer,
  ICredentialPlugin,
  ICredentialVerifier,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IResolver,
} from '@veramo/core'
import { DriverOptions } from './drivers'

export type IRequiredPlugins = IDataStore &
  IDataStoreORM &
  IDIDManager &
  IKeyManager &
  ICredentialIssuer &
  ICredentialVerifier &
  ICredentialPlugin &
  IResolver
export type IRequiredContext = IAgentContext<IRequiredPlugins>

export interface Driver {
  statusListStore: StatusListStore

  getType(): StatusListDriverType

  getOptions(): DriverOptions

  getStatusListLength(args?: { correlationId?: string }): Promise<number>

  createStatusList(args: { statusListCredential: OriginalVerifiableCredential; correlationId?: string }): Promise<StatusListDetails>

  getStatusList(args?: { correlationId?: string }): Promise<StatusListDetails>

  updateStatusListEntry(args: IAddStatusListEntryArgs): Promise<{
    credentialStatus: StatusList2021EntryCredentialStatus
    statusListEntry: IStatusListEntryEntity
  }>

  getStatusListEntryByCredentialId(args: IGetStatusListEntryByCredentialIdArgs): Promise<IStatusListEntryEntity | undefined>

  getStatusListEntryByIndex(args: IGetStatusListEntryByIndexArgs): Promise<IStatusListEntryEntity | undefined>

  updateStatusList(args: { statusListCredential: OriginalVerifiableCredential }): Promise<StatusListDetails>

  deleteStatusList(): Promise<boolean>

  getRandomNewStatusListIndex(args?: { correlationId?: string }): Promise<number>

  isStatusListIndexInUse(): Promise<boolean>
}
