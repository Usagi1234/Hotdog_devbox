#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting Hotdog API Server...')

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Start the server
const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  cwd: __dirname
})

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`)
})

server.on('error', (error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  server.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...')
  server.kill('SIGTERM')
}) 