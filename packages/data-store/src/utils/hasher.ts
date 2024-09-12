import { Hasher } from '@sphereon/ssi-types'
import sha from 'sha.js'

const supportedAlgorithms = ['sha256', 'sha384', 'sha512'] as const
type SupportedAlgorithms = (typeof supportedAlgorithms)[number]

// FIXME this is a weird place for this, but it does have good reach in ssi-sdk cunlike the copy in oid4vc-common
export const defaultHasher: Hasher = (data, algorithm) => {
  const sanitizedAlgorithm = algorithm.toLowerCase().replace(/[-_]/g, '')
  if (!supportedAlgorithms.includes(sanitizedAlgorithm as SupportedAlgorithms)) {
    throw new Error(`Unsupported hashing algorithm ${algorithm}`)
  }

  return new Uint8Array(
    sha(sanitizedAlgorithm as SupportedAlgorithms)
      .update(data)
      .digest(),
  )
}