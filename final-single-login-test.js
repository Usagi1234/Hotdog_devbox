const crypto = require('crypto')
const axios = require('axios')

// Configuration
const config = {
  api: {
    url: 'https://seamless.hotdog-gaming.com',
    secretKey: '2230e64b4cb3cc83f8efc12392674fc4'
  },
  gateway: {
    url: 'http://localhost:9888'
  }
}

// Test data according to Hotdog documentation
const testData = {
  agent_id: 'Merchant',
  game_id: 'hd-bull-bull',
  player_id: 'PLAYER1',
  session_id: '0cb1c7ee02a59716dddba52c379ecd0d',
  language: 'th',
  currency: 'THB',
  return_url: ''
}

console.log('=== FINAL SINGLE LOGIN VERIFICATION ===')
console.log('Test Data:', JSON.stringify(testData, null, 2))
console.log('Secret Key:', config.api.secretKey)

// Step 1: Generate signature
function generateSignature(data, secret) {
  let requestJson = JSON.stringify(data)
  requestJson = requestJson.replace(/\//g, "\\/") // Escape forward slashes
  const signature = crypto.createHmac('sha256', secret).update(requestJson).digest('hex')
  return signature
}

const signature = generateSignature(testData, config.api.secretKey)
console.log('\nGenerated Signature:', signature)

// Step 2: Show complete request format
console.log('\n=== COMPLETE REQUEST FORMAT ===')
console.log('URL:', `${config.api.url}/singlelogin`)
console.log('Method: POST')
console.log('Headers:')
console.log('  Content-Type: application/json')
console.log('  x-sign:', signature)
console.log('\nBody:')
console.log(JSON.stringify(testData, null, 2))

// Step 3: Test direct Hotdog API
async function testDirectHotdogAPI() {
  console.log('\n=== TESTING DIRECT HOTDOG API ===')
  try {
    const response = await axios({
      method: 'post',
      url: `${config.api.url}/singlelogin`,
      headers: {
        'Content-Type': 'application/json',
        'x-sign': signature
      },
      data: testData,
      timeout: 10000
    })
    
    console.log('✅ Direct API Response Status:', response.status)
    console.log('✅ Direct API Response Data:', JSON.stringify(response.data, null, 2))
    
    // Check response format
    if (response.data.hasOwnProperty('status') && response.data.hasOwnProperty('url')) {
      console.log('✅ Response format matches documentation')
      if (response.data.status === true) {
        console.log('🎉 SUCCESS! Single login working correctly!')
      } else {
        console.log('⚠️  API responded but status is false')
      }
    } else {
      console.log('❌ Response format does not match documentation')
    }
    
    return response.data
  } catch (error) {
    console.log('❌ Direct API Error:', error.response?.status || error.code)
    console.log('❌ Direct API Error Data:', error.response?.data || error.message)
    
    // Analyze error
    if (error.response?.data?.code === 'INVALID_SIGN_OR_IP') {
      console.log('🔍 ERROR ANALYSIS: INVALID_SIGN_OR_IP')
      console.log('   - This usually means IP whitelist or credential issues')
    } else if (error.response?.data?.code === 'FAILED_GET_BALANCE_AGENT') {
      console.log('🔍 ERROR ANALYSIS: FAILED_GET_BALANCE_AGENT')
      console.log('   - Need to provide balance endpoint before launch game')
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('🔍 ERROR ANALYSIS: Connection issue')
      console.log('   - Check if Hotdog API is accessible')
    }
    
    return null
  }
}

// Step 4: Test Gateway API
async function testGatewayAPI() {
  console.log('\n=== TESTING GATEWAY API ===')
  try {
    const response = await axios({
      method: 'post',
      url: `${config.gateway.url}/api/single-login`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: testData,
      timeout: 10000
    })
    
    console.log('✅ Gateway Response Status:', response.status)
    console.log('✅ Gateway Response Data:', JSON.stringify(response.data, null, 2))
    
    if (response.data.hasOwnProperty('statusCode') && response.data.statusCode === 200) {
      console.log('✅ Gateway API working correctly')
    } else {
      console.log('❌ Gateway API error')
    }
    
    return response.data
  } catch (error) {
    console.log('❌ Gateway Error:', error.response?.status || error.code)
    console.log('❌ Gateway Error Data:', error.response?.data || error.message)
    return null
  }
}

// Step 5: Generate questions for Hotdog support
function generateHotdogQuestions() {
  console.log('\n=== QUESTIONS FOR HOTDOG SUPPORT ===')
  console.log('Please ask Hotdog support the following questions:')
  console.log('')
  console.log('1. IP WHITELIST:')
  console.log('   - What is our server IP address that needs to be whitelisted?')
  console.log('   - Is our IP already whitelisted in your system?')
  console.log('')
  console.log('2. CREDENTIALS VERIFICATION:')
  console.log('   - Agent ID: "Merchant" - is this correct?')
  console.log('   - Secret Key: "2230e64b4cb3cc83f8efc12392674fc4" - is this valid?')
  console.log('   - Do we need additional API keys or credentials?')
  console.log('')
  console.log('3. API ENDPOINTS:')
  console.log('   - Single Login: https://seamless.hotdog-gaming.com/singlelogin')
  console.log('   - Game List: https://seamless.hotdog-gaming.com/game/list')
  console.log('   - Are these endpoints correct and active?')
  console.log('')
  console.log('4. SIGNATURE VERIFICATION:')
  console.log('   - We are using HMAC SHA256 with forward slash escaping')
  console.log('   - Can you verify our signature generation is correct?')
  console.log('   - Test data: {"agent_id":"Merchant","game_id":"hd-bull-bull","player_id":"PLAYER1","session_id":"0cb1c7ee02a59716dddba52c379ecd0d","language":"th","currency":"THB","return_url":""}')
  console.log('   - Our signature: ' + signature)
  console.log('')
  console.log('5. BALANCE ENDPOINT:')
  console.log('   - Do we need to provide a balance endpoint before single login?')
  console.log('   - What is the required format for balance endpoint?')
  console.log('')
  console.log('6. ERROR CODES:')
  console.log('   - What does "INVALID_SIGN_OR_IP" error mean exactly?')
  console.log('   - What does "FAILED_GET_BALANCE_AGENT" error mean?')
  console.log('   - Are there other error codes we should be aware of?')
  console.log('')
  console.log('7. TESTING:')
  console.log('   - Can you provide test credentials for development?')
  console.log('   - Is there a sandbox/test environment available?')
  console.log('   - What are the recommended test values for game_id, player_id, etc.?')
}

// Run tests
async function runFinalTests() {
  console.log('🚀 Starting final verification tests...\n')
  
  // Test direct Hotdog API
  const directResult = await testDirectHotdogAPI()
  
  // Test Gateway API
  const gatewayResult = await testGatewayAPI()
  
  // Generate questions
  generateHotdogQuestions()
  
  // Summary
  console.log('\n=== FINAL SUMMARY ===')
  if (directResult && directResult.status === true) {
    console.log('✅ Direct Hotdog API: SUCCESS - Everything working correctly!')
  } else {
    console.log('❌ Direct Hotdog API: FAILED - Need to contact Hotdog support')
  }
  
  if (gatewayResult && gatewayResult.statusCode === 200) {
    console.log('✅ Gateway API: SUCCESS - Our implementation is correct')
  } else {
    console.log('❌ Gateway API: FAILED - Check our implementation')
  }
  
  console.log('\n📝 NEXT STEPS:')
  console.log('1. Contact Hotdog support with the questions above')
  console.log('2. Provide them with our server IP for whitelisting')
  console.log('3. Verify all credentials and endpoints')
  console.log('4. Test with their provided test environment if available')
}

// Run the tests
runFinalTests().catch(console.error) 