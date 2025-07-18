'use strict'

const apiHandler = require('./api.handler')
const validations = require('./api.validations')

const routes = [
  {
    method: 'POST',
    path: '/api/list-games',
    handler: apiHandler.listGames,
    options: {
      description: 'Get game list for Hotdog',
      tags: ['api'],
      auth: false,
      validate: validations.listGames
    }
  },
  {
    method: 'POST',
    path: '/api/single-login',
    handler: apiHandler.singleLogin,
    options: {
      description: 'Single login to Hotdog gaming platform',
      tags: ['api'],
      auth: false,
      validate: validations.singleLogin
    }
  },
  {
    method: 'POST',
    path: '/api/signature/generate',
    handler: apiHandler.generateSignature,
    options: {
      description: 'Generate X-Sign signature for testing',
      tags: ['api'],
      validate: validations.generateSignature
    }
  }
]

module.exports = routes 