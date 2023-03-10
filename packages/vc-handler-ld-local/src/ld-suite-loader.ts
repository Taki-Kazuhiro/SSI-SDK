import { TKeyType } from '@veramo/core'

import { SphereonLdSignature } from './ld-suites'

/**
 * Initializes a list of Veramo-wrapped LD Signature suites and exposes those to the Agent Module
 */
export class LdSuiteLoader {
  constructor(options: { ldSignatureSuites: SphereonLdSignature[] }) {
    options.ldSignatureSuites.forEach((obj) => {
      const veramoKeyType = obj.getSupportedVeramoKeyType()
      const verificationType = obj.getSupportedVerificationType()
      if (this.signatureMap[veramoKeyType]) {
        throw Error(`Cannot register 2 suites for the same type ${veramoKeyType}`)
      }
      this.signatureMap[veramoKeyType] = obj
      if (verificationType !== veramoKeyType) {
        if (this.signatureMap[verificationType]) {
          throw Error(`Cannot register 2 suites for the same type ${verificationType}`)
        }
        this.signatureMap[verificationType] = obj
      }
    })
  }
  private signatureMap: Record<string, SphereonLdSignature> = {}

  getSignatureSuiteForKeyType(type: TKeyType, verificationType?: string): SphereonLdSignature {
    // Always use verification type if supplied. This is the type denoted by the DID verification method type

    const suite = verificationType && this.signatureMap[verificationType] ? this.signatureMap[verificationType] : this.signatureMap[type]
    if (suite) return suite

    throw new Error('No Sphereon or Veramo LD Signature Suite for ' + type)
  }

  getAllSignatureSuites(): SphereonLdSignature[] {
    return Object.values(this.signatureMap)
  }

  getAllSignatureSuiteTypes(): string[] {
    return Object.values(this.signatureMap).map((x) => x.getSupportedVerificationType())
  }
}
