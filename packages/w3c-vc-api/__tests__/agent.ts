// import { IonPublicKeyPurpose } from '@decentralized-identity/ion-sdk'
import { getUniResolver } from '@sphereon/did-uni-client'
import { getDidJwkResolver } from '@sphereon/ssi-sdk-ext.did-resolver-jwk'
import { IPresentationExchange, PresentationExchange } from '@sphereon/ssi-sdk.presentation-exchange'
import {
  CredentialHandlerLDLocal,
  ICredentialHandlerLDLocal,
  LdDefaultContexts,
  MethodNames,
  SphereonBbsBlsSignature2020,
  SphereonEcdsaSecp256k1RecoverySignature2020,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local'
import { createAgent, ICredentialPlugin, ICredentialVerifier, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore } from '@veramo/data-store'
import { DIDManager } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { getDidIonResolver, IonDIDProvider } from '@veramo/did-provider-ion'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import Debug from 'debug'
import { Resolver } from 'did-resolver'
import { VCAPIServer } from '../src'
import { DB_CONNECTION_NAME, DB_ENCRYPTION_KEY, getDbConnection } from './database'
import { JwkDIDProvider } from '@sphereon/ssi-sdk-ext.did-provider-jwk'

const debug = Debug('sphereon:vc-api')

export const DIF_UNIRESOLVER_RESOLVE_URL = 'https://dev.uniresolver.io/1.0/identifiers'
// export const APP_ID = 'sphereon:rp-demo'
export const DID_PREFIX = 'did'

export enum KeyManagementSystemEnum {
  LOCAL = 'local',
}

export enum SupportedDidMethodEnum {
  DID_ETHR = 'ethr',
  DID_KEY = 'key',
  // DID_LTO = 'lto',
  DID_ION = 'ion',
  // DID_FACTOM = 'factom',
  DID_JWK = 'jwk',
}
const PRIVATE_KEY_HEX =
  'ea6aaeebe17557e0fe256bfce08e8224a412ea1e25a5ec8b5d69618a58bad89e89a4661e446b46401325a38d3b20582d1dd277eb448a3181012a671b7ae15837'
const PUBLIC_KEY_HEX = '89a4661e446b46401325a38d3b20582d1dd277eb448a3181012a671b7ae15837'

/*const RP_PRIVATE_KEY_HEX = '7dd923e40f4615ac496119f7e793cc2899e99b64b88ca8603db986700089532b'
const RP_PUBLIC_KEY_HEX = '04a23cb4c83901acc2eb0f852599610de0caeac260bf8ed05e7f902eaac0f9c8d74dd4841b94d13424d32af8ec0e9976db9abfa7e3a59e10d565c5d4d901b4be63'*/
// const RP_DID = 'did:ion:EiAG1fCl2kHSyZv7Z1Bb1eL7b_PVbiHaoxGki-5s8PjsFQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmUUE3WUpNRk1qNXFET0RrS25qR1ZLNW0za1VSRFc1YnJ1TWhUa1NYSGQwIiwieSI6IlI3cVBNNEsxWHlqNkprM3M2a3I2aFNrQzlDa0ExSEFpMVFTejZqSU56dFkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQmRpaVlrT3kyd3VOQ3Z5OWs4X1RoNzhSSlBvcy04MzZHZWpyRmJycTROZFEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFTdTN1NGxsRk5KRkNEbTU5VFVBS1NSLTg3QUpsNFNzWEhlS05kbVRydXp3IiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEZXBoWHJVQVdCcWswcnFBLTI3bE1ib08zMFZZVFdoV0Y0NHBlanJyXzNOQSJ9fQ'
// const RP_DID_SHORT = 'did:ion:EiAeobpQwEVpR-Ib9toYwbISQZZGIBck6zIUm0ZDmm9v0g'
/*const RP_DID =
  'did:ion:EiAeobpQwEVpR-Ib9toYwbISQZZGIBck6zIUm0ZDmm9v0g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmUUE3WUpNRk1qNXFET0RrS25qR1ZLNW0za1VSRFc1YnJ1TWhUa1NYSGQwIiwieSI6IlI3cVBNNEsxWHlqNkprM3M2a3I2aFNrQzlDa0ExSEFpMVFTejZqSU56dFkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQnpwN1loTjltaFVjWnNGZHhuZi1sd2tSVS1oVmJCdFpXc1ZvSkhWNmprd0EifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJvbWxvZ0JPOERROFdpVVFsa3diYmxuMXpsRFU2Q3Jvc01wNDRySjYzWHhBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEQVFYU2k3SGNqSlZCWUFLZE8yenJNNEhmeWJtQkJDV3NsNlBRUEpfamtsQSJ9fQ'
const PRIVATE_RECOVERY_KEY_HEX = '7c90c0575643d09a370c35021c91e9d8af2c968c5f3a4bf73802693511a55b9f'
const PRIVATE_UPDATE_KEY_HEX = '7288a92f6219c873446abd1f8d26fcbbe1caa5274b47f6f086ef3e7e75dcad8b'*/
// const RP_DID_KID = `${RP_DID}#auth-key`

export const resolver = new Resolver({
  /*// const SPHEREON_UNIRESOLVER_RESOLVE_URL = 'https://uniresolver.test.sphereon.io/1.0/identifiers'
      ...getUniResolver('jwk', {
          resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
      }),
      ...getUniResolver('ion', {
          resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
      }),
      ..getUniResolver('lto', {
          resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
      }),*/
  ...getUniResolver('ethr', {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getDidKeyResolver(),
  ...getDidJwkResolver(),
  ...getUniResolver('jwk', {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getDidIonResolver(),
})

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'ropsten',
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
}

const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))

const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IPresentationExchange &
    ICredentialVerifier &
    ICredentialHandlerLDLocal &
    ICredentialPlugin
>({
  plugins: [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(privateKeyStore),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`,
      providers: didProviders,
    }),
    new DIDResolverPlugin({
      resolver,
    }),
    new PresentationExchange(),
    new CredentialPlugin(),
    new CredentialHandlerLDLocal({
      contextMaps: [LdDefaultContexts],
      suites: [
        new SphereonEd25519Signature2018(),
        new SphereonEd25519Signature2020(),
        new SphereonBbsBlsSignature2020(),
        new SphereonJsonWebSignature2020(),
        new SphereonEcdsaSecp256k1RecoverySignature2020(),
      ],
      bindingOverrides: new Map([
        ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
        ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
      ]),
      keyStore: privateKeyStore,
    }),
  ],
})

// let keyRef = "did:ion:EiAeobpQwEVpR-Ib9toYwbISQZZGIBck6zIUm0ZDmm9v0g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmUUE3WUpNRk1qNXFET0RrS25qR1ZLNW0za1VSRFc1YnJ1TWhUa1NYSGQwIiwieSI6IlI3cVBNNEsxWHlqNkprM3M2a3I2aFNrQzlDa0ExSEFpMVFTejZqSU56dFkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQnpwN1loTjltaFVjWnNGZHhuZi1sd2tSVS1oVmJCdFpXc1ZvSkhWNmprd0EifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJvbWxvZ0JPOERROFdpVVFsa3diYmxuMXpsRFU2Q3Jvc01wNDRySjYzWHhBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEQVFYU2k3SGNqSlZCWUFLZE8yenJNNEhmeWJtQkJDV3NsNlBRUEpfamtsQSJ9fQ"

// agent.didManagerImport({did: RP_DID, keys: })
agent.dataStoreORMGetIdentifiers().then((ids) => ids.forEach((id) => console.log(JSON.stringify(id, null, 2))))
agent
  .didManagerCreate({
    provider: 'did:jwk',
    alias: 'test',
    options: {
      type: 'Ed25519',
      key: {
        privateKeyHex: PRIVATE_KEY_HEX,
      },
    },
  })
  /*.didManagerCreate({
      provider: 'did:ion',
      alias: RP_DID,
      options: {
        kid: 'auth-key',
        anchor: false,
        recoveryKey: {
          kid: 'recovery-test2',
          key: {
            privateKeyHex: PRIVATE_RECOVERY_KEY_HEX,
          },
        },
        updateKey: {
          kid: 'update-test2',
          key: {
            privateKeyHex: PRIVATE_UPDATE_KEY_HEX,
          },
        },
        verificationMethods: [
          {
            key: {
              kid: 'auth-key',
              privateKeyHex: RP_PRIVATE_KEY_HEX,
            },
            purposes: [IonPublicKeyPurpose.Authentication, IonPublicKeyPurpose.AssertionMethod],
          },
        ],
      },
    })*/
  .then((value) => {
    debug(`IDENTIFIER: ${value.did}`)
  })
  .catch((reason) => {
    console.log(`error on creation:  ${reason}`)
  })
  .finally(
    () =>
      new VCAPIServer({
        opts: {
          issueCredentialOpts: {
            proofFormat: 'lds',
            fetchRemoteContexts: true,
            persistIssuedCredentials: true,
            keyRef: PUBLIC_KEY_HEX,
          },
          serverOpts: {
            hostname: '0.0.0.0',
            port: 5000,
          },
        },
        agent,
      })
  )

export default agent