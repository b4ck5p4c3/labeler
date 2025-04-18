import ky from "ky";
import path from 'path';
import type { DigikeySearchResponse } from "./types";

const MAX_FONT3_CHARS_PER_LINE = 36;

interface TemplateParams {
  model: string;
  description: string;
  inventoryNumber: string;
  properties: Record<string, string>;
  datasheet: string | null;
}

interface Persistence {
  latestInventoryNumber: number;
  items: Record<string, TemplateParams>;

  digikey?: {
    token: string;
    expiration: string;
  }
}

const persistanceFile = Bun.file(path.resolve(__dirname, "persistence.json"));
if (!await persistanceFile.exists()) {
  await persistanceFile.write(JSON.stringify({
    latestInventoryNumber: 20,
    items: {},
  }))
}

const persistance = await persistanceFile.json() as Persistence;


export function splitInChunks(
  str: string,
  groupSize: number,
  separator: string = ""
): string {
  const regex = new RegExp(`.{1,${groupSize}}`, "g");
  const matches = str.match(regex);
  return matches ? matches.join(separator) : ''; 
}

const USELESS_KEYWORDS = [
  'supplier',
  'rohs',
  'digikey',
]

export function filterMeaningfulProps(props: Record<string, string>): Record<string, string> {
  const filtered = Object.entries(props).filter(([key, value]) => {
    if (USELESS_KEYWORDS.find(k => key.toLowerCase().indexOf(k) !== -1)) {
      return false;
    }

    if (value === 'No' || value === '-' || value === 'N/A' || value === '') {
      return false;
    }

    return true;
  });

  return Object.fromEntries(filtered);
}

// 1mm = 8 dots
// Font 3 = 16x24 dots
// Font 4 = 24x32 dots
// Font 5 = 32x48 dots

function splitSentencesToLines(
  text: string,
  maxLetters: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLetters) {
      currentLine += (currentLine.length ? " " : "") + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function render(params: TemplateParams): string {
  let currentY = 0;
  const program: string[] = [
    'REM SIZE 75mm, 120mm',
    'SIZE 75 mm, 120 mm',
    'GAP 5mm',
    'DENSITY 10',
    'REFERENCE 0,24',
    'CLS',
  ];

  /* Header */
  program.push(`TEXT 16,${currentY},"5",0,1,1,"${params.model}"`);
  currentY += 64;

  const descriptionLines = splitSentencesToLines(params.description, MAX_FONT3_CHARS_PER_LINE);
  for (const line of descriptionLines) {
    program.push(`TEXT 16,${currentY},"3",0,1,1,"${line}"`);
    currentY += 32;
  }

  /* Body */
  currentY += 24;
  {
    const maxPropsFit = 11 - descriptionLines.length;
    const filteredProps = filterMeaningfulProps(params.properties);
    for (const [key, value] of Object.entries(filteredProps).slice(0, maxPropsFit)) {
      program.push(`TEXT 16,${currentY},"3",0,1,1,"${key.slice(0, 38)}:"`);
      currentY += 32;
      program.push(`TEXT 16,${currentY},"2",0,1,1,"${value.slice(0, 38)}"`);
      currentY += 32;
    }
  }

  /* Codes */

  /* Footer */
  const maxY = 120 * 8;
  program.push(`TEXT 16,${maxY - 100},"3",0,3,3,"${splitInChunks(params.inventoryNumber, 3, ' ')}"`);
  program.push(`REVERSE 0,${maxY - 120},360,160`);
  program.push(`QRCODE 440,780,H,5,A,0,"https://i.bksp.in/${params.inventoryNumber}"`);

  program.push(`PRINT 1`);
  program.push(`END`);
  return program.join("\n");
}

async function print(params: TemplateParams) {
  const template = render(params)
    .replaceAll('µ', 'u')
    .replaceAll('°', "'")
    .replaceAll('±', '+-')


  const response = await fetch("http://labeler.int.bksp.in/tspl", {
    method: "POST",
    headers: {
      "Content-Type": "application/tspl",
    },
    body: template,
  });

  if (!response.ok) {
    throw new Error(`Error printing label: ${response.statusText}`);
  }
}

async function getDigikeyToken(): Promise<string> {
  if (persistance.digikey) {
    const expiration = new Date(persistance.digikey.expiration);
    if (expiration > new Date()) {
      return persistance.digikey.token;
    }
  }

  const body = new URLSearchParams({
    client_id: process.env.DIGIKEY_CLIENT_ID!,
    client_secret: process.env.DIGIKEY_CLIENT_SECRET!,
    grant_type: "client_credentials",
  })

  const request = await ky.post("https://api.digikey.com/v1/oauth2/token", {
    body: body.toString(),
    throwHttpErrors: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
  });

  if (!request.ok) {
    const body = await request.text();
    throw new Error(`Error fetching Digikey token: ${request.statusText} - ${body}`);
  }

  const response = await request.json() as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  const expiration = new Date(response.expires_in * 1000 + Date.now());
  persistance.digikey = {
    token: response.access_token,
    expiration: expiration.toISOString(),
  };

  await persistanceFile.write(JSON.stringify(persistance, null, 2));
  return response.access_token;
}

async function getProductInformation(search: string): Promise<TemplateParams | null> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${await getDigikeyToken()}`);
  headers.append("Accept", "application/json");
  headers.append("Content-Type", "application/json");
  headers.append("X-DIGIKEY-Client-Id", "oGCzT2DiEAXfvC23KrTCE09P1skFUGkG");

  const request = await ky.post(`https://api.digikey.com/products/v4/search/keyword`, {
    headers,
    json: {
      "Keywords": search,
      "Limit": 20,
      "Offset": 0
    },
    throwHttpErrors: false,
  });

  if (!request.ok) {
    throw new Error(`Error fetching product information: ${request.statusText}`);
  }

  const response = await request.json() as DigikeySearchResponse;
  if (response.Products.length === 0) {
    console.error('No products found');
    return null;
  }

  for (const optionIdx in response.Products) {
    const option = response.Products[optionIdx]!;
    console.log(`(${Number(optionIdx)}) ${option.ManufacturerProductNumber}`);
    console.log(`\t ${option.Description.DetailedDescription ?? option.Description.ProductDescription}`)
    console.log(`\t ${option.Parameters?.map(p => `${p.ParameterText}: ${p.ValueText}`).join('; ')}`);
  }

  const choice = prompt('> ')
  if (choice === null) {
    console.error('No choice made');
    return null;
  }
  const choiceIdx = parseInt(choice);
  const pick = response.Products[choiceIdx]!

  return {
    model: pick.ManufacturerProductNumber,
    datasheet: pick.DatasheetUrl ?? null,
    description: pick.Description?.DetailedDescription ?? pick.Description?.ProductDescription ?? '',
    inventoryNumber: (persistance.latestInventoryNumber + 1).toString().padStart(6, '0'),
    properties: pick.Parameters ? filterMeaningfulProps(
      Object.fromEntries(pick.Parameters.map(p => [p.ParameterText, p.ValueText]))
    ) : {},
  }
}

async function reprint(inventoryNumber: string) {
  const item = persistance.items[inventoryNumber];
  if (!item) {
    console.error(`Item with inventory number ${inventoryNumber} not found`);
    return;
  }

  await print(item);
}

const query = process.argv[2];
if (!query) {
  console.error('Usage: bun test.ts <search>');
  process.exit(1);
}

if (query === '--reprint') {
  const inventoryNumber = process.argv[3];
  if (!inventoryNumber) {
    console.error('Usage: bun test.ts --reprint <inventoryNumber>');
    process.exit(1);
  }

  await reprint(inventoryNumber);
  process.exit(0);
}

// Find closest match in our pool
const possibleMatches = Object.values(persistance.items).filter(item => {
  if (item.model.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(item.model.toLowerCase())) {
    return true;
  }

  return false;
});

if (possibleMatches.length) {
  console.log('Found possible matches:');
  for (const item of possibleMatches) {
    console.log(`(${item.inventoryNumber}) ${item.model} - ${item.description}`);
  }

  prompt('Continue (enter), Exit (Ctrl+C)')
}


const result = await getProductInformation(query);
if (result) {
  console.log('Printing...');
  await print(result);

  persistance.items[result.inventoryNumber] = result;
  persistance.latestInventoryNumber = parseInt(result.inventoryNumber);
  await persistanceFile.write(JSON.stringify(persistance, null, 2));
}