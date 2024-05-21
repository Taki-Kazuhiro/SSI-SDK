import { IIdentifier } from '@veramo/core'

export type MetadataTypes = string | number | Date | boolean | undefined

export type Party = {
  id: string
  uri?: string
  roles: Array<IdentityRole>
  ownerId?: string
  tenantId?: string
  identities: Array<Identity>
  electronicAddresses: Array<ElectronicAddress>
  physicalAddresses: Array<PhysicalAddress>
  contact: Contact
  partyType: PartyType
  relationships: Array<PartyRelationship>
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedParty = Omit<
  Party,
  | 'id'
  | 'identities'
  | 'electronicAddresses'
  | 'physicalAddresses'
  | 'contact'
  | 'roles'
  | 'partyType'
  | 'relationships'
  | 'createdAt'
  | 'lastUpdatedAt'
> & {
  identities?: Array<NonPersistedIdentity>
  electronicAddresses?: Array<NonPersistedElectronicAddress>
  physicalAddresses?: Array<NonPersistedPhysicalAddress>
  contact: NonPersistedContact
  partyType: NonPersistedPartyType
  relationships?: Array<NonPersistedPartyRelationship>
}
export type PartialParty = Partial<
  Omit<Party, 'identities' | 'electronicAddresses' | 'physicalAddresses' | 'contact' | 'partyType' | 'relationships'>
> & {
  identities?: PartialIdentity
  electronicAddresses?: PartialElectronicAddress
  physicalAddresses?: PartialPhysicalAddress
  contact?: PartialContact
  partyType?: PartialPartyType
  relationships?: PartialPartyRelationship
}

export type Identity = {
  id: string
  alias: string
  ownerId?: string
  tenantId?: string
  origin: IdentityOrigin
  roles: Array<IdentityRole>
  identifier: CorrelationIdentifier
  connection?: Connection
  metadata?: Array<MetadataItem<MetadataTypes>>
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedIdentity = Omit<Identity, 'id' | 'identifier' | 'connection' | 'metadata' | 'origin' | 'createdAt' | 'lastUpdatedAt'> & {
  origin: IdentityOrigin
  identifier: NonPersistedCorrelationIdentifier
  connection?: NonPersistedConnection
  metadata?: Array<NonPersistedMetadataItem<MetadataTypes>>
}
export type PartialIdentity = Partial<Omit<Identity, 'identifier' | 'connection' | 'metadata' | 'origin' | 'roles'>> & {
  identifier?: PartialCorrelationIdentifier
  connection?: PartialConnection
  metadata?: PartialMetadataItem<MetadataTypes> // Usage: FindIdentityArgs = Array<PartialIdentity>
  origin?: IdentityOrigin
  roles?: IdentityRole
  partyId?: string
}

export type MetadataItem<T extends MetadataTypes> = {
  id: string
  label: string
  value: T
}

export type NonPersistedMetadataItem<T extends MetadataTypes> = Omit<MetadataItem<T>, 'id'>
export type PartialMetadataItem<T extends MetadataTypes> = Partial<MetadataItem<T>>

export type CorrelationIdentifier = {
  id: string
  ownerId?: string
  tenantId?: string
  type: CorrelationIdentifierType
  correlationId: string
}
export type NonPersistedCorrelationIdentifier = Omit<CorrelationIdentifier, 'id'>
export type PartialCorrelationIdentifier = Partial<CorrelationIdentifier>

export type Connection = {
  id: string
  ownerId?: string
  tenantId?: string
  type: ConnectionType
  config: ConnectionConfig
}
export type NonPersistedConnection = Omit<Connection, 'id' | 'config'> & {
  config: NonPersistedConnectionConfig
}
export type PartialConnection = Partial<Omit<Connection, 'config'>> & {
  config: PartialConnectionConfig
}

export type OpenIdConfig = {
  id: string
  clientId: string
  clientSecret: string
  ownerId?: string
  tenantId?: string
  scopes: Array<string>
  issuer: string
  redirectUrl: string
  dangerouslyAllowInsecureHttpRequests: boolean
  clientAuthMethod: 'basic' | 'post' | undefined
}
export type NonPersistedOpenIdConfig = Omit<OpenIdConfig, 'id'>
export type PartialOpenIdConfig = Partial<OpenIdConfig>

export type DidAuthConfig = {
  id: string
  identifier: IIdentifier
  stateId: string
  ownerId?: string
  tenantId?: string
  redirectUrl: string
  sessionId: string
}
export type NonPersistedDidAuthConfig = Omit<DidAuthConfig, 'id'>
export type PartialDidAuthConfig = Partial<Omit<DidAuthConfig, 'identifier'>> & {
  identifier: Partial<IIdentifier> // TODO, we need to create partials for sub types in IIdentifier
}

export type ConnectionConfig = OpenIdConfig | DidAuthConfig
export type NonPersistedConnectionConfig = NonPersistedDidAuthConfig | NonPersistedOpenIdConfig
export type PartialConnectionConfig = PartialOpenIdConfig | PartialDidAuthConfig

export type NaturalPerson = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  displayName: string
  metadata?: Array<MetadataItem<MetadataTypes>>
  ownerId?: string
  tenantId?: string
  createdAt: Date
  lastUpdatedAt: Date
}

export type NonPersistedNaturalPerson = Omit<NaturalPerson, 'id' | 'createdAt' | 'lastUpdatedAt'>

export type PartialNaturalPerson = Partial<Omit<NaturalPerson, 'metadata'>> & {
  metadata?: PartialMetadataItem<MetadataTypes>
}

export type Organization = {
  id: string
  legalName: string
  displayName: string
  metadata?: Array<MetadataItem<MetadataTypes>>
  ownerId?: string
  tenantId?: string
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedOrganization = Omit<Organization, 'id' | 'createdAt' | 'lastUpdatedAt'>
export type PartialOrganization = Partial<Omit<Organization, 'metadata'>> & {
  metadata?: PartialMetadataItem<MetadataTypes>
}

export type Contact = NaturalPerson | Organization
export type NonPersistedContact = NonPersistedNaturalPerson | NonPersistedOrganization
export type PartialContact = PartialNaturalPerson | PartialOrganization

export type PartyType = {
  id: string
  type: PartyTypeType
  origin: PartyOrigin
  name: string
  tenantId: string
  description?: string
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedPartyType = Omit<PartyType, 'id' | 'createdAt' | 'lastUpdatedAt'> & {
  id?: string
}
export type PartialPartyType = Partial<PartyType>

export type PartyRelationship = {
  id: string
  leftId: string
  rightId: string
  ownerId?: string
  tenantId?: string
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedPartyRelationship = Omit<PartyRelationship, 'id' | 'createdAt' | 'lastUpdatedAt'>
export type PartialPartyRelationship = Partial<PartyRelationship>

export type ElectronicAddress = {
  id: string
  type: ElectronicAddressType
  electronicAddress: string
  ownerId?: string
  tenantId?: string
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedElectronicAddress = Omit<ElectronicAddress, 'id' | 'createdAt' | 'lastUpdatedAt'>
export type PartialElectronicAddress = Partial<ElectronicAddress> & {
  partyId?: string
}

export type PhysicalAddress = {
  id: string
  type: PhysicalAddressType
  streetName: string
  streetNumber: string
  postalCode: string
  cityName: string
  provinceName: string
  countryCode: string
  buildingName?: string
  ownerId?: string
  tenantId?: string
  createdAt: Date
  lastUpdatedAt: Date
}
export type NonPersistedPhysicalAddress = Omit<PhysicalAddress, 'id' | 'createdAt' | 'lastUpdatedAt'>
export type PartialPhysicalAddress = Partial<PhysicalAddress> & {
  partyId?: string
}

export type ElectronicAddressType = 'email' | 'phone'

export type PhysicalAddressType = 'home' | 'visit' | 'postal'

export enum IdentityRole {
  ISSUER = 'issuer',
  VERIFIER = 'verifier',
  HOLDER = 'holder',
}

export enum ConnectionType {
  OPENID_CONNECT = 'OIDC',
  SIOPv2 = 'SIOPv2',
  SIOPv2_OpenID4VP = 'SIOPv2+OpenID4VP',
}

export enum CorrelationIdentifierType {
  DID = 'did',
  URL = 'url',
}

export enum PartyTypeType {
  NATURAL_PERSON = 'naturalPerson',
  ORGANIZATION = 'organization',
}

export enum PartyOrigin {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum IdentityOrigin {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}
