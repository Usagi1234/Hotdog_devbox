'use strict'

const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const config = require('config')
const logger = require('../utils/logger')
const crypto = require('crypto')

module.exports = {
  /**
   * Get list of games from Hotdog gaming platform
   */
  getListGames: async ({ currency, agent_id }) => {
    const options = {
      method: 'post',
      url: `${config.get('api.url')}/game/list`,
      data: {
        currency,
        agent_id
      }
    };
    try {
      const response = await axios(options);
      const data = response.data;
      
      // Transform the response to include required fields
      const transformedData = (data.list || []).map(game => ({
        code: game.code || game.id || '',
        name: game.name || game.title || '',
        type: game.type || game.category || '',
        active: game.active !== undefined ? game.active : true,
        imageUrl: game.imageUrl || game.image_url || game.thumbnail || ''
      }));
      
      return transformedData;
    } catch (error) {
      console.error('External API error:', error.response?.data || error.message);
      logger.error(error, 'Failed to fetch /game/list from Hotdog platform');
      throw error;
    }
  },

  /**
   * Single login to Hotdog gaming platform
   */
  singleLogin: async ({ agent_id, game_id, player_id, session_id, language, currency, return_url }) => {
    const data = {
      agent_id,
      game_id,
      player_id,
      session_id,
      language,
      currency,
      return_url
    }
    
    // Generate signature according to Hotdog documentation
    let requestJson = JSON.stringify(data)
    requestJson = requestJson.replace(/\//g, "\\/")
    
    const signature = crypto.createHmac('sha256', config.get('auth.secretKey'))
      .update(requestJson)
      .digest('hex')
    
    const options = {
      method: 'post',
      url: `${config.get('api.url')}/singlelogin`,
      headers: {
        'Content-Type': 'application/json',
        'x-sign': signature
      },
      data: data
    };
    
    try {
      const response = await axios(options);
      const responseData = response.data;
      
      logger.info({ player_id, game_id }, 'Single login successful');
      
      return {
        status: responseData.status || false,
        url: responseData.url || ''
      };
    } catch (error) {
      console.error('External API error:', error.response?.data || error.message);
      
      // Handle specific error mentioned in documentation
      if (error.response?.data?.error === 'FAILED_GET_BALANCE_AGENT') {
        logger.error(error, 'Failed to get balance from agent - please provide balance endpoint before launch game');
        throw new Error('FAILED_GET_BALANCE_AGENT: Please provide balance endpoint before launch game');
      }
      
      logger.error(error, 'Failed to single login to Hotdog platform');
      throw error;
    }
  }
} 