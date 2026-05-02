async function print(inventoryNumber: string): Promise<void> {
  const program: string[] = [
    'SIZE 15 mm, 15 mm',
    'GAP 2mm',
    'DENSITY 10',
    'REFERENCE 0,0',
    'CLS',
  ]
  
  program.push(`QRCODE 29,10,H,3,A,0,"https://i.bksp.in/${inventoryNumber}"`)
  program.push(`TEXT 29,105,"1",1,1,1,"BS ${inventoryNumber}"`)
  program.push('PRINT 1')
  program.push('END')
  
  const response = await fetch('http://labeler.int.bksp.in/tspl', {
    body: program.join('\n'),
    headers: {
      'Content-Type': 'application/tspl',
    },
    method: 'POST',
  })
  
  console.log(response.status)
}

const number = process.argv[2]
if (!number) {
  console.error('Please provide an inventory number as an argument.')
  process.exit(1)
}

print(number)