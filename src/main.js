const net = require('net')
const log = console.log

let config = {
  socketTimeout: 10 * 1000,
  port: '',
  host: '',
  reconnectTimeout: 2 * 1000,
  maxReconnectTimes: 10,
  logBufferSize: 1000
}

let state = {
  connection: null,
  connected: false,
  currentReconnectTimes: 0,
  logBuffer: []
}

function onConnection () {
  log('onConnection')

  state.connected = true
  state.currentReconnectTimes = 0

  emptyBuffer()
}

function onClose (hadError) {
  log('onClose, hadError: ', hadError)
  state.connected = false

  if (hadError) {
    realReconnect()
  }
}

function onError (e) {
  log('onError: ', e)
  state.connected = false
  state.connection.destroy()

  realReconnect()
}

function realReconnect () {
  state.currentReconnectTimes++

  if (state.currentReconnectTimes > config.maxReconnectTimes) {
    log('currentReconnectTimes > maxReconnectTimes, no more reconnect')
    return
  }

  setTimeout(init, config.reconnectTimeout)
}

function sendMsg (msg) {
  try {
    msg = JSON.stringify(msg) + '\n'
    state.connection.write(msg)
  } catch (error) {
    log(error)
  }
}

function sendToBuffer (msg) {
  if (state.logBuffer.length > config.logBufferSize) {
    log('overflow of log buffer')
    return
  }
  state.logBuffer.push(msg)
}

function emptyBuffer () {
  state.logBuffer.forEach((item) => {
    sendMsg(item)
  })
  state.logBuffer = []
}

function init (params = {}) {
  config = Object.assign(config, params)
  config.port = parseInt(config.port)

  state.connection = net.createConnection(config.port, config.host, onConnection)
  state.connection.setTimeout(config.socketTimeout)
  state.connection.on('error', onError)
  state.connection.on('close', onClose)
}

function send (msg) {
  if (state.connected) {
    sendMsg(msg)
  } else {
    sendToBuffer(msg)
  }
}

module.exports = {
  init, send
}
