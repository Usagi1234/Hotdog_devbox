'use strict'

const crypto = require('crypto')
const Boom = require('@hapi/boom')
const config = require('config')
const logger = require('./logger')

/**
 * Generate X-Sign signature from request payload
 * @param {Object} payload - Request payload
 * @param {string} secret - Secret key
 * @returns {string} - Generated signature
 */
const generateSignature = (payload, secret) => {
  try {
    let requestJson = JSON.stringify(payload)
    // Important: escape forward slashes according to Hotdog documentation
    requestJson = requestJson.replace(/\//g, "\\/")
    const sign = crypto.createHmac('sha256', secret).update(requestJson).digest('hex')
    return sign
  } catch (error) {
    logger.error(error, 'Failed to generate signature')
    throw error
  }
}

/**
 * Verify X-Sign signature
 * @param {Object} payload - Request payload
 * @param {string} providedSignature - Signature from request header
 * @param {string} secret - Secret key
 * @returns {boolean} - True if signature is valid
 */
const verifySignature = (payload, providedSignature, secret) => {
  try {
    const expectedSignature = generateSignature(payload, secret)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )
    
    logger.info({
      providedSignature,
      expectedSignature,
      isValid
    }, 'Signature verification result')
    
    return isValid
  } catch (error) {
    logger.error(error, 'Failed to verify signature')
    return false
  }
}

/**
 * Middleware to verify X-Sign header
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object|null} - Boom error if invalid, null if valid
 */
const verifyXSignHeader = (request, h) => {
  try {
    const xSignHeader = request.headers['x-sign']
    
    if (!xSignHeader) {
      logger.warn('Missing X-Sign header')
      return Boom.unauthorized('Missing X-Sign header')
    }
    
    const secret = config.get('auth.secretKey')
    const payload = request.payload
    
    if (!payload) {
      logger.warn('Missing request payload')
      return Boom.badRequest('Missing request payload')
    }
    
    const isValid = verifySignature(payload, xSignHeader, secret)
    
    if (!isValid) {
      logger.warn({
        providedSignature: xSignHeader,
        payload: JSON.stringify(payload)
      }, 'Invalid X-Sign signature')
      return Boom.unauthorized('Invalid X-Sign signature')
    }
    
    logger.info('X-Sign signature verified successfully')
    return null
  } catch (error) {
    logger.error(error, 'Error verifying X-Sign header')
    return Boom.internal('Error verifying signature')
  }
}

module.exports = {
  generateSignature,
  verifySignature,
  verifyXSignHeader
} 