const crypto = require('crypto')

// Signature from Postman screenshot
const postmanSignature = '54866977131c2d7aef632bf5f777bc57e790000ef67291617893ce0797b1f500'

// Our current data
const ourData = {
  agent_id: 'Merchant',
  game_id: 'hd-bull-bull',
  player_id: 'PLAYER1',
  session_id: '0cb1c7ee02a59716dddba52c379ecd0d',
  language: 'th',
  currency: 'THB',
  return_url: ''
}

// Secret key
const secret = '2230e64b4cb3cc83f8efc12392674fc4'

console.log('=== DEBUGGING SIGNATURE DIFFERENCE ===')
console.log('Postman Signature:', postmanSignature)
console.log('Our Data:', JSON.stringify(ourData, null, 2))

// Generate our signature
function generateSignature(data, secret) {
  let requestJson = JSON.stringify(data)
  requestJson = requestJson.replace(/\//g, "\\/")
  const signature = crypto.createHmac('sha256', secret).update(requestJson).digest('hex')
  return signature
}

const ourSignature = generateSignature(ourData, secret)
console.log('\nOur Signature:', ourSignature)
console.log('Signatures Match:', ourSignature === postmanSignature)

// Try different variations
console.log('\n=== TRYING DIFFERENT VARIATIONS ===')

// Variation 1: Different session_id (from Postman screenshot)
const data1 = {
  ...ourData,
  session_id: 'da5fb04eb5f762bcfb1d5a7cc8d822a1' // From Postman screenshot
}
const sig1 = generateSignature(data1, secret)
console.log('Variation 1 (different session_id):', sig1)
console.log('Matches Postman:', sig1 === postmanSignature)

// Variation 2: Different agent_id
const data2 = {
  ...ourData,
  agent_id: 'Merchant' // Old agent_id
}
const sig2 = generateSignature(data2, secret)
console.log('Variation 2 (Merchant agent_id):', sig2)
console.log('Matches Postman:', sig2 === postmanSignature)

// Variation 3: Different game_id
const data3 = {
  ...ourData,
  game_id: 'lobby' // Try lobby instead
}
const sig3 = generateSignature(data3, secret)
console.log('Variation 3 (lobby game_id):', sig3)
console.log('Matches Postman:', sig3 === postmanSignature)

// Variation 4: Different language
const data4 = {
  ...ourData,
  language: 'en' // English instead of Thai
}
const sig4 = generateSignature(data4, secret)
console.log('Variation 4 (en language):', sig4)
console.log('Matches Postman:', sig4 === postmanSignature)

// Variation 5: Different currency
const data5 = {
  ...ourData,
  currency: 'USD' // USD instead of THB
}
const sig5 = generateSignature(data5, secret)
console.log('Variation 5 (USD currency):', sig5)
console.log('Matches Postman:', sig5 === postmanSignature)

// Variation 6: With return_url
const data6 = {
  ...ourData,
  return_url: 'https://agentsite.com' // Add return_url
}
const sig6 = generateSignature(data6, secret)
console.log('Variation 6 (with return_url):', sig6)
console.log('Matches Postman:', sig6 === postmanSignature)

// Show the exact data that would match
console.log('\n=== EXACT DATA THAT WOULD MATCH ===')
console.log('If any variation matches, that\'s the correct data format!') 