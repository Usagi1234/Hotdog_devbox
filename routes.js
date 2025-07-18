'use strict'

const glob = require('glob')
const path = require('path')
const _ = require('lodash')
const config = require('config')

// add ping route by default for health check
const routes = [{
  method: 'GET',
  path: '/health',
  handler: function (request, h) {
    return h.response(`Good health ${config.util.getEnv('NODE_ENV')}`).code(200)
  },
  options: {
    auth: false,
    tags: ['api']
  }
}]

// add all routes from all modules to the routes array manually or write your routes inside a folder inside the server folder
// with suffix as Routes.js e.g weatherRoutes.js
glob.sync('./server/**/*.routes.js').forEach((file) => {
  const routeModule = require(path.resolve(file))
  // If the module exports an array, spread it; otherwise, add it as a single route
  if (Array.isArray(routeModule)) {
    routes.push(...routeModule)
  } else {
    routes.push(routeModule)
  }
})

// export routes
module.exports = _.flattenDeep(routes) 