'use strict'

const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')
const Good = require('good')
const GoodConsole = require('good-console')

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
  },
  {
    plugin: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-console'
          },
          'stdout'
        ]
      }
    }
  }
] 