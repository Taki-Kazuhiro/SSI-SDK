import fetch from 'cross-fetch'
import { imageSize } from 'image-size'
import { IImageDimensions, IImageResource } from '../types'
import * as u8a from 'uint8arrays'

type SizeCalculationResult = {
  width?: number
  height?: number
  orientation?: number
  type?: string
}

// TODO: here we're handling svg separately, remove this section when image-size starts supporting it in version 2
const isSvg = (uint8Array: Uint8Array): boolean => {
  const maxCheckLength: number = Math.min(80, uint8Array.length)
  const initialText: string = u8a.toString(uint8Array.subarray(0, maxCheckLength))
  const normalizedText: string = initialText.trim().toLowerCase()
  return normalizedText.startsWith('<svg') || normalizedText.startsWith('<?xml')
}

function parseDimension(dimension: string): number | undefined {
  const match: RegExpMatchArray | null = dimension.match(/^(\d+(?:\.\d+)?)([a-z%]*)$/)
  return match ? parseFloat(match[1]) : 0
}

const getSvgDimensions = (uint8Array: Uint8Array): SizeCalculationResult => {
  const svgContent: string = new TextDecoder().decode(uint8Array)
  const widthMatch: RegExpMatchArray | null = svgContent.match(/width="([^"]+)"/)
  const heightMatch: RegExpMatchArray | null = svgContent.match(/height="([^"]+)"/)
  const viewBoxMatch: RegExpMatchArray | null = svgContent.match(/viewBox="[^"]*"/)

  let width: number | undefined = widthMatch ? parseDimension(widthMatch[1]) : undefined
  let height: number | undefined = heightMatch ? parseDimension(heightMatch[1]) : undefined

  if (viewBoxMatch && (!width || !height)) {
    const parts = viewBoxMatch[0].match(/[\d\.]+/g)?.map(Number)
    if (parts && parts.length === 4) {
      const [x, y, viewBoxWidth, viewBoxHeight] = parts
      width = width ?? viewBoxWidth - x
      height = height ?? viewBoxHeight - y
    }
  }

  return { width, height, type: 'svg' }
}

export const getImageMediaType = async (base64: string): Promise<string | undefined> => {
  const buffer: Buffer = Buffer.from(base64, 'base64')
  if (isSvg(buffer)) {
    return `image/svg+xml`
  }
  const result: SizeCalculationResult = imageSize(buffer)
  return `image/${result.type}`
}

export const getImageDimensions = async (base64: string): Promise<IImageDimensions> => {
  const buffer: Buffer = Buffer.from(base64, 'base64')
  const dimensions: SizeCalculationResult = isSvg(buffer) ? getSvgDimensions(buffer) : imageSize(buffer)

  if (!dimensions.width || !dimensions.height) {
    return Promise.reject(Error('Unable to get image dimensions'))
  }

  return { width: dimensions.width, height: dimensions.height }
}

export const downloadImage = async (url: string): Promise<IImageResource> => {
  const response: Response = await fetch(url)
  if (!response.ok) {
    return Promise.reject(Error(`Failed to download resource. Status: ${response.status} ${response.statusText}`))
  }

  const contentType: string | null = response.headers.get('Content-Type')
  const base64Content: string = Buffer.from(await response.arrayBuffer()).toString('base64')

  return {
    base64Content,
    contentType: contentType || undefined,
  }
}
