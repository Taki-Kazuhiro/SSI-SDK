import { getConfig } from '@veramo/cli/build/setup'
import { createObjects } from '@veramo/cli/build/lib/objectCreator'
import { ServiceTypesEnum } from '@sphereon/wellknown-dids-client/dist/types'
import wellKnownDidVerifierAgentLogic from './shared/wellKnownDidVerifierAgentLogic'

jest.setTimeout(30000)

let agent: any

const setup = async (): Promise<boolean> => {
  const config = getConfig('packages/wellknown-did-verifier/agent.yml')
  const { localAgent } = createObjects(config, { localAgent: '/agent' })

  await localAgent.registerSignatureVerification({
    signatureVerificationKey: 'verified',
    signatureVerification: () => Promise.resolve({ verified: true })
  }, null)

  const DID = 'did:key:z6MkoTHsgNNrby8JzCNQ1iRLyW5QQ6R8Xuu6AA8igGrMVPUM';
  const ORIGIN = 'https://example.com';
  const DOCUMENT = {
    '@context': [
        'https://www.w3.org/ns/did/v1',
      'https://identity.foundation/.well-known/did-configuration/v1'
    ],
    id: DID,
    verificationMethod: [
      {
        id: `${DID}#_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A`,
        type: 'JsonWebKey2020',
        controller: DID,
        publicKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'VCpo2LMLhn6iWku8MKvSLg2ZAoC-nlOyPVQaO3FxVeQ',
        },
      },
    ],
    service: [
      {
        id: `${DID}#foo`,
        type: ServiceTypesEnum.LINKED_DOMAINS,
        serviceEndpoint: {
          origins: [ORIGIN, ORIGIN],
        },
      },
      {
        id: `${DID}#bar`,
        type: ServiceTypesEnum.LINKED_DOMAINS,
        serviceEndpoint: ORIGIN,
      },
    ],
  };

  localAgent.resolveDid = jest.fn().mockReturnValue(Promise.resolve({ didDocument: DOCUMENT }))

  agent = localAgent

  return true
}

const tearDown = async (): Promise<boolean> => {
  return true
}

const getAgent = () => agent
const testContext = {
  getAgent,
  setup,
  tearDown,
  isRestTest: false,
}

describe('Local integration tests', () => {
  wellKnownDidVerifierAgentLogic(testContext)
})
