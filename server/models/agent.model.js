const { query } = require('../utils/db')
const config = require('config')

// constructor
const Agent = function (agent) {
  this.id = agent.id
  this.agent_prefix = agent.agent_prefix
}

Agent.findById = (id) => {
  const table = config.get('table.agent') || 'agent'
  return new Promise((resolve, reject) => {
    query(`SELECT * FROM ${table} WHERE agent_id = ${id}`, (err, res) => {
      if (err) {
        return reject(err)
      }

      return resolve(res[0])
    })
  })
}

module.exports = Agent
