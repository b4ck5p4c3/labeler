import { JSDOM } from 'jsdom'
import ky from 'ky'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import promptSync from 'prompt-sync'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Lock } from 'semaphore-async-await'
import { transliter } from 'transliter'

import type { DigikeySearchResponse } from './digikey-types'
import type { LCSCSearchResponse } from './lcsc-types'

import { getEnvironment } from './environment'

const environment = getEnvironment()

const prompt = promptSync()

const MAX_FONT3_CHARS_PER_LINE = 36

enum ProductInfoProvider {
  CHIPDIP = 'chipdip',
  DIGIKEY = 'digikey',
  LCSC = 'lcsc'
}

type Datasheet = null | string | string[]

type GetDatasheetFunction = () => Promise<Datasheet>

interface AbstractProductInfo {
  datasheet: Datasheet | GetDatasheetFunction;
  description: string;
  model: string;
  properties: Record<string, string>;
  provider: ProductInfoProvider;
  url: string;
}

interface TemplateParameters extends AbstractProductInfo {
  datasheet: Datasheet;
  inventoryNumber: string;
}

interface Persistence {
  digikey?: {
    expiration: string;
    token: string;
  }
  items: Record<string, TemplateParameters>;

  latestInventoryNumber: number;
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PERSISTENCE_FILE_PATH = path.resolve(__dirname, '..', 'persistence.json')

export function splitInChunks (
  string_: string,
  groupSize: number,
  separator: string = ''
): string {
  const regex = new RegExp(`.{1,${groupSize}}`, 'g')
  const matches = string_.match(regex)
  return matches ? matches.join(separator) : ''
}

const USELESS_KEYWORDS = [
  'supplier',
  'rohs',
  'digikey',
]

export function filterMeaningfulProperties (properties: Record<string, string>): Record<string, string> {
  const filtered = Object.entries(properties).filter(([key, value]) => {
    if (USELESS_KEYWORDS.some(k => key.toLowerCase().includes(k))) {
      return false
    }

    if (value === 'No' || value === '-' || value === 'N/A' || value === '') {
      return false
    }

    return true
  })

  return Object.fromEntries(filtered)
}

// 1mm = 8 dots
// Font 3 = 16x24 dots
// Font 4 = 24x32 dots
// Font 5 = 32x48 dots

function splitSentencesToLines (
  text: string,
  maxLetters: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLetters) {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function render (parameters: TemplateParameters): string {
  let currentY = 0
  const program: string[] = [
    'REM SIZE 75mm, 120mm',
    'SIZE 75 mm, 120 mm',
    'GAP 5mm',
    'DENSITY 10',
    'REFERENCE 0,24',
    'CLS',
  ]

  program.push(`TEXT 20,14,"3",0,3,3,"${splitInChunks(parameters.inventoryNumber, 3, ' ')}"`, 'REVERSE 0,0,364,80')
  currentY += 100

  /* Header */
  program.push(`TEXT 16,${currentY},"5",0,1,1,"${parameters.model}"`)
  currentY += 64

  const descriptionLines = splitSentencesToLines(parameters.description, MAX_FONT3_CHARS_PER_LINE)
  for (const line of descriptionLines) {
    program.push(`TEXT 16,${currentY},"3",0,1,1,"${line}"`)
    currentY += 32
  }

  /* Body */
  currentY += 24
  {
    const maxPropertiesFit = 11 - descriptionLines.length
    const filteredProperties = filterMeaningfulProperties(parameters.properties)
    for (const [key, value] of Object.entries(filteredProperties).slice(0, maxPropertiesFit)) {
      program.push(`TEXT 16,${currentY},"3",0,1,1,"${key.slice(0, 38)}:"`)
      currentY += 32
      program.push(`TEXT 16,${currentY},"2",0,1,1,"${value.slice(0, 38)}"`)
      currentY += 32
    }
  }

  /* Footer */
  program.push(`QRCODE 440,780,H,5,A,0,"https://i.bksp.in/${parameters.inventoryNumber}"`, 'PRINT 1', 'END')
  return program.join('\n')
}

async function print (parameters: TemplateParameters) {
  const template = render(parameters)
    .replaceAll('µ', 'u')
    .replaceAll('°', "'")
    .replaceAll('±', '+-')
    .replaceAll('℃', '\'C')
    .replaceAll('…', '...')

  const response = await fetch('http://labeler.int.bksp.in/tspl', {
    body: transliter(template, 'iso9'),
    headers: {
      'Content-Type': 'application/tspl',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`error printing label: ${response.statusText}`)
  }
}

async function getDigikeyToken (persistence: Persistence): Promise<string> {
  if (persistence.digikey) {
    const expiration = new Date(persistence.digikey.expiration)
    if (expiration > new Date()) {
      return persistence.digikey.token
    }
  }

  const body = new URLSearchParams({
    client_id: environment.DIGIKEY_CLIENT_ID,
    client_secret: environment.DIGIKEY_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  const request = await ky.post('https://api.digikey.com/v1/oauth2/token', {
    body: body.toString(),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    throwHttpErrors: false,
  })

  if (!request.ok) {
    const body = await request.text()
    throw new Error(`error fetching Digikey token: ${request.statusText} - ${body}`)
  }

  const response = await request.json() as {
    access_token: string;
    expires_in: number;
    token_type: string;
  }

  const expiration = new Date(response.expires_in * 1000 + Date.now())
  persistence.digikey = {
    expiration: expiration.toISOString(),
    token: response.access_token,
  }

  fs.writeFileSync(PERSISTENCE_FILE_PATH, JSON.stringify(persistence, null, 2))
  return response.access_token
}

async function getDigikeyProductVariants (persistence: Persistence, search: string): Promise<AbstractProductInfo[]> {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${await getDigikeyToken(persistence)}`)
  headers.append('Accept', 'application/json')
  headers.append('Content-Type', 'application/json')
  headers.append('X-DIGIKEY-Client-Id', 'oGCzT2DiEAXfvC23KrTCE09P1skFUGkG')

  const request = await ky.post('https://api.digikey.com/products/v4/search/keyword', {
    headers,
    json: {
      Keywords: search,
      Limit: 20,
      Offset: 0
    },
    throwHttpErrors: false,
  })

  if (!request.ok) {
    console.error(`error fetching product information from Digikey: ${request.statusText}`)
    return []
  }

  const response = await request.json() as DigikeySearchResponse

  return response.Products.map(product => ({
    datasheet: product.DatasheetUrl ?? null,
    description: product.Description?.DetailedDescription ?? product.Description?.ProductDescription ?? '',
    model: product.ManufacturerProductNumber,
    properties: product.Parameters
      ? filterMeaningfulProperties(
          Object.fromEntries(product.Parameters.map(p => [p.ParameterText, p.ValueText]))
        )
      : {},
    provider: ProductInfoProvider.DIGIKEY,
    url: product.ProductUrl
  }))
}

async function getLCSCProductVariants (search: string): Promise<AbstractProductInfo[]> {
  const request = await ky.post('https://wmsc.lcsc.com/ftps/wm/search/v2/global', {
    json: {
      keyword: search
    },
    throwHttpErrors: false
  })

  if (!request.ok) {
    console.error(`error fetching product information from LCSC: ${request.statusText}`)
    return []
  }

  const response = await request.json() as LCSCSearchResponse

  return response.result.productSearchResultVO?.productList?.map(product => ({
    datasheet: product.pdfUrl ?? null,
    description: product.catalogName + ' - ' + product.productIntroEn,
    model: product.productModel,
    properties: product.paramVOList
      ? Object.fromEntries(product.paramVOList.map(parameter => [parameter.paramNameEn, parameter.paramValueEn]))
      : {},
    provider: ProductInfoProvider.LCSC,
    url: product.url
  })) ?? []
}

interface ChipDipGroupVariant {
  count: string
  name: string
  url: string
}

async function getChipdipDatasheets (itemUrl: string): Promise<Datasheet> {
  const itemText = await fetchFromPuppeteer(itemUrl)
  const itemHtml = new JSDOM(itemText)
  const datasheetNodes = [...itemHtml.window.document.querySelectorAll('.download__link.with-pdfpreview')]
  const datasheets = [...new Set(datasheetNodes.map(node => {
    if (node.tagName === 'a') {
      return (node as HTMLAnchorElement).href
    }
    return null
  }).filter(Boolean) as string[])]
  const firstDatasheet = datasheets[0]
  return datasheets.length === 1 && firstDatasheet ? firstDatasheet : datasheets
}

console.info('starting puppeteer...')
puppeteer.use(StealthPlugin())
const chipDipPuppeteer = await puppeteer.launch({
  headless: false
})
const chipdipPage = await chipDipPuppeteer.newPage()
await chipdipPage.goto('https://www.chipdip.ru', {
  waitUntil: 'domcontentloaded'
})
console.info('started')

const chipDipPuppeteerLock = new Lock()

async function fetchFromPuppeteer (url: string): Promise<string> {
  await chipDipPuppeteerLock.acquire()
  try {
    await chipdipPage.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    for (let index = 0; index < 20; index++) {
      if (await chipdipPage.$('.header__main-link-icon')) {
        return await chipdipPage.content()
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.info('waiting...')
    }
    throw new Error('timeouted')
  } finally {
    chipDipPuppeteerLock.release()
  }
}

async function findChipdipGroupVariants (search: string): Promise<ChipDipGroupVariant[]> {
  const url = `https://www.chipdip.ru/search?searchtext=${encodeURIComponent(search)}`
  const searchResponseText = await fetchFromPuppeteer(url)
  const searchResponseHtml = new JSDOM(searchResponseText)

  const groupNodes = [...searchResponseHtml.window.document.querySelectorAll('li:has(.serp__group-col-item)')]
  if (groupNodes.length === 0) {
    const otherGroupNodes = [...searchResponseHtml.window.document.querySelectorAll('td.group-header-wrap')]
    return otherGroupNodes.map(node => {
      const count = node.querySelector('sub')?.textContent ?? 'N/A'
      const linkNode = node.querySelector('a')
      if (!linkNode) {
        return null
      }

      const name = linkNode.textContent
      const groupName = (name.match(/«(.*?)»/ig) ?? [])[1] ?? name
      const url = linkNode.href

      return {
        count,
        name: groupName,
        url
      }
    }).filter(Boolean) as ChipDipGroupVariant[]
  }

  return groupNodes.map(node => {
    const count = node.querySelector('sub')?.textContent ?? 'N/A'
    const nameNode = node.querySelector('a')
    if (!nameNode) {
      return null
    }

    const name = nameNode.textContent
    const url = nameNode.href

    return {
      count,
      name,
      url
    }
  }).filter(Boolean) as ChipDipGroupVariant[]
}

async function getChipdipProductVariants (search: string): Promise<AbstractProductInfo[]> {
  const groupVariants = await findChipdipGroupVariants(search)

  if (groupVariants.length === 0) {
    return []
  }

  for (const optionIndex in groupVariants) {
    const option = groupVariants[optionIndex]
    if (!option) {
      throw new Error('wtf?')
    }
    console.log(`(${Number(optionIndex)}) ${option.name} (${option.count})`)
  }

  const choice = prompt('> ')
  if (choice === null) {
    console.error('no choice made')
    return []
  }

  const choiceIndex = Number.parseInt(choice)
  const pick = groupVariants[choiceIndex]
  if (!pick) {
    throw new Error('what chioce did you make?')
  }

  const nextSearchText = await fetchFromPuppeteer(`https://chipdip.ru${pick.url}&ps=x3`)
  const nextSearchHtml = new JSDOM(nextSearchText)

  const itemNodes = [...nextSearchHtml.window.document.querySelectorAll('tr.with-hover')]

  const result: AbstractProductInfo[] = []

  for (const itemNode of itemNodes) {
    const nameAndLinkNode = itemNode.querySelector('a.link') as HTMLAnchorElement
    if (!nameAndLinkNode) {
      continue
    }
    const name = nameAndLinkNode.textContent
    const url = `https://www.chipdip.ru${nameAndLinkNode.href}`

    const properties: Record<string, string> = {}
    const propertyNodes = [...itemNode.querySelectorAll('div.pps > div:not(.av_w2)')]
    for (const propertyNode of propertyNodes) {
      const key = propertyNode.firstChild?.textContent?.replace(/:(\s*)$/, '')
      if (!key) {
        continue
      }
      const value = propertyNode.lastChild?.textContent?.replace(/^(\s*):(\s*)/, '') ?? 'N/A'
      properties[key] = value
    }

    result.push({
      datasheet: () => getChipdipDatasheets(url),
      description: name,
      model: name,
      properties,
      provider: ProductInfoProvider.CHIPDIP,
      url
    })
  }

  return result
}

async function getProductInformation (persistence: Persistence, search: string,
  forceOnlyChipDip: boolean = false): Promise<null | TemplateParameters> {
  let variants: AbstractProductInfo[]
  if (forceOnlyChipDip) {
    variants = []
  } else {
    const searchResults = await Promise.all([getDigikeyProductVariants(persistence, search),
      getLCSCProductVariants(search)])
    variants = searchResults.flat()
  }

  if (variants.length === 0) {
    if (!forceOnlyChipDip) {
      console.error('nothing found anywhere, trying chipdip...')
    }

    variants = await getChipdipProductVariants(search)
  }

  console.log('(cd) ChipDip: force ChipDip search')
  for (const optionIndex in variants) {
    const option = variants[optionIndex]
    if (!option) {
      throw new Error('wtf?')
    }
    console.log(`(${Number(optionIndex)}) ${option.provider}: ${option.model}`)
    console.log(`\t ${option.description}`)
    console.log(`\t ${Object.entries(option.properties).map(([k, v]) => `${k}: ${v}`).join('; ')}`)
  }

  const choice = prompt('> ')
  if (choice === null) {
    console.error('no choice made')
    return null
  }
  if (choice === 'cd') {
    return await getProductInformation(persistence, search, true)
  }
  const choiceIndex = Number.parseInt(choice)
  const pick = variants[choiceIndex]
  if (!pick) {
    console.error('no choice made')
    return null
  }

  const realDatasheet = pick.datasheet !== null && typeof pick.datasheet !== 'string' && !Array.isArray(pick.datasheet)
    ? (await pick.datasheet())
    : pick.datasheet

  return {
    ...pick,
    datasheet: realDatasheet,
    inventoryNumber: (persistence.latestInventoryNumber + 1).toString().padStart(6, '0')
  }
}

async function reprint (persistence: Persistence, inventoryNumber: string) {
  const item = persistence.items[inventoryNumber]
  if (!item) {
    console.error(`item with inventory number ${inventoryNumber} not found`)
    return
  }

  await print(item)
}

while (true) {
  const persistence = JSON.parse(fs.readFileSync(PERSISTENCE_FILE_PATH).toString('utf8')) as Persistence

  try {
    const query = prompt('> ')
    if (query === null) {
      await chipDipPuppeteer.close()
      process.exit(0)
    }

    if (query === 'reprint') {
      const reprintNumber = prompt('number to reprint > ')
      await reprint(persistence, reprintNumber)
      continue
    }

    // Find closest match in our pool
    const possibleMatches = Object.values(persistence.items).filter(item => {
      if (item.model.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(item.model.toLowerCase())) {
        return true
      }

      return false
    })

    if (possibleMatches.length > 0) {
      console.log('found possible matches:')
      for (const item of possibleMatches) {
        console.log(`(${item.inventoryNumber}) ${item.model} - ${item.description}`)
      }

      prompt('continue (enter), exit (Ctrl+C)')
    }

    const result = await getProductInformation(persistence, query)
    if (result) {
      console.log('printing...')
      await print(result)

      persistence.items[result.inventoryNumber] = result
      persistence.latestInventoryNumber = Number.parseInt(result.inventoryNumber)
      fs.writeFileSync(PERSISTENCE_FILE_PATH, JSON.stringify(persistence, null, 2))
    }
  } catch (error) {
    console.error(error)
  }
}
