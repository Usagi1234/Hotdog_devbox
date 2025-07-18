'use strict'

const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')

module.exports = [
  {
    plugin: Inert
  },
  {
    plugin: Vision
  },
  {
    plugin: HapiSwagger,
    options: {
      info: {
        title: 'Hotdog API Documentation',
        version: '1.0.0'
      }
    }
  }
] 