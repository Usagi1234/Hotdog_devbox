'use strict'

const Boom = require('@hapi/boom')
const httpStatus = require('http-status')
const _ = require('lodash')
const config = require('config')
const crypto = require('crypto')
const apiService = require('./api.service')
const logger = require('../utils/logger')
const { verifyXSignHeader } = require('../utils/signature')

// Error codes
const ERROR = {
  SUCCESS: {
    CODE: 0, MESSAGE: 'Success.'
  },
  INVALID_SIGNATURE: {
    CODE: 20001, MESSAGE: 'Invalid X-Sign signature'
  },
  MISSING_SIGNATURE: {
    CODE: 20002, MESSAGE: 'Missing X-Sign header'
  },
  SERVER_ERROR: {
    CODE: 50001, MESSAGE: 'Internal server error'
  }
}

// Standard response format
const response = function (error, data = null, message = null) {
  const response = {
    statusCode: error.CODE === 0 ? 200 : error.CODE,
    timestamp: new Date().toISOString()
  }
  
  if (data) {
    response.data = data
  }
  
  logger.debug('Response:', response)
  return response
}

module.exports = {
  /**
   * Pre-handler middleware for X-Sign verification
   */
  verifyXSignMiddleware: async (request, h) => {
    try {
      const verificationError = verifyXSignHeader(request, h)
      if (verificationError) {
        return verificationError
      }
      return h.continue
    } catch (error) {
      logger.error(error, 'Error in X-Sign middleware')
      return Boom.unauthorized('Signature verification failed')
    }
  },

  /**
   * Get list of games from Hotdog gaming platform
   */
  listGames: async (request, h) => {
    try {
      const { currency, agent_id } = request.payload
      const data = await apiService.getListGames({ currency, agent_id })
      
      logger.info('Games list retrieved successfully')
      
      return h.response(response(ERROR.SUCCESS, data))
        .code(httpStatus.OK)
    } catch (error) {
      const errorMessage = 'Failed to list games'
      logger.error(error, errorMessage)
      return h.response(response(ERROR.SERVER_ERROR))
        .code(httpStatus.INTERNAL_SERVER_ERROR)
    }
  },

  /**
   * Single login to Hotdog gaming platform
   */
  singleLogin: async (request, h) => {
    try {
      const { agent_id, game_id, player_id, session_id, language, currency, return_url } = request.payload
      const data = await apiService.singleLogin({ 
        agent_id, 
        game_id, 
        player_id, 
        session_id, 
        language, 
        currency, 
        return_url 
      })
      
      logger.info('Single login successful')
      
      return h.response(response(ERROR.SUCCESS, data))
        .code(httpStatus.OK)
    } catch (error) {
      const errorMessage = 'Failed to single login'
      logger.error(error, errorMessage)
      return h.response(response(ERROR.SERVER_ERROR))
        .code(httpStatus.INTERNAL_SERVER_ERROR)
    }
  },

  /**
   * Generate signature for testing purposes
   */
  generateSignature: async (request, h) => {
    try {
      const payload = request.payload
      const secret = config.get('auth.secretKey')
      const { generateSignature } = require('../utils/signature')
      
      // Generate md5 for session_id if player_id is provided
      let md5SessionId = null
      if (payload.player_id) {
        const timestamp = Date.now().toString()
        md5SessionId = crypto.createHash('md5')
          .update(`${payload.player_id}:${timestamp}`)
          .digest('hex')
      }
      
      const signature = generateSignature(payload, secret)
      
      // Custom response: only statusCode, timestamp, signature, md5
      return h.response({
        statusCode: 200,
        timestamp: new Date().toISOString(),
        signature,
        md5: md5SessionId
      }).code(httpStatus.OK)
    } catch (error) {
      logger.error(error, 'Failed to generate signature')
      return h.response(response(ERROR.SERVER_ERROR))
        .code(httpStatus.INTERNAL_SERVER_ERROR)
    }
  }
} 