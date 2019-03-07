const net = require('net')
const config = require('config')
const logstashHostAndPort = config.get('SDK_logstash_host')
const debug = require('debug')
const debugLog = debug('app:log')
const debugError = debug('app:error')

const SOCKET_TIME_OUT = 10 * 1000
const MAX_RECONNECT_TIMES = 10
const RECONNECT_INTERVAL = 5 * 1000
let currentReconnectTimes = 0

let client = null
let clientPort = ''
let clientHost = ''
let fixedFields = null
let connected = false
let buf = []
let bufMaxLength = 1000

function createClient (port, host, fixed) {
  fixedFields = fixed || {}
  clientPort = port
  clientHost = host
  client = net.createConnection(port, host, onConnectListener)
  client.setTimeout(SOCKET_TIME_OUT)
  client.on('error', onError)
  client.on('close', onClose)
}

function onConnectListener (e) {
  debugLog('connect logstash success')
  connected = true
  currentReconnectTimes = 0
  writeBufMsg()
}

function reconnctClient () {
  currentReconnectTimes++
  if (currentReconnectTimes === MAX_RECONNECT_TIMES) {
    debugError('reconnection timeout MAX_RECONNECT_TIMES')
  } else {
    createClient(clientPort, clientHost, fixedFields)
  }
}

function realReconnect () {
  setTimeout(reconnctClient, RECONNECT_INTERVAL)
}

function onClose (e) {
  console.log('end', e)
  connected = false
  realReconnect()
}

function onError (e) {
  debugError('error', e)
  connected = false
  client.destroy()
  realReconnect()
}

function stringify (obj) {
  return JSON.stringify(obj) + '\n'
}

function saveToBuf (msg) {
  if (buf.length > bufMaxLength) {
    debugError('buf fulled, please log later')
  } else {
    buf.push(msg)
  }
}

function writeBufMsg () {
  if (buf.length > 0 && connected) {
    buf.forEach((msg) => {
      client.write(msg)
    })
    buf = []
  }
}

function write (msg) {
  if (connected) {
    writeBufMsg()
    client.write(msg)
  } else {
    saveToBuf(msg)
  }
}

function rawLog (payload) {
  try {
    write(stringify(payload))
  } catch (error) {
    console.error(error)
  }
}

function log (msg = '', tags = {}) {
  debugLog(msg, tags)
  if (typeof msg !== 'string') {
    try {
      msg = JSON.stringify(msg)
    } catch (error) {
      console.error(error)
      return
    }
  }
  if (Object.prototype.toString.call(tags) !== '[object Object]') {
    console.error('tags must be a object')
    return
  }

  let payload = {
    message: msg
  }
  payload = Object.assign(payload, tags, fixedFields, { level: 'INFO' })

  rawLog(payload)
}

function error (msg = '', tags = {}) {
  debugError(msg, tags)
  if (typeof msg !== 'string') {
    try {
      msg = JSON.stringify(msg)
    } catch (error) {
      console.error(error)
      return
    }
  }
  if (Object.prototype.toString.call(tags) !== '[object Object]') {
    console.error('tags must be a object')
    return
  }
  let payload = {
    message: msg
  }
  payload = Object.assign(payload, tags, fixedFields, { level: 'ERROR' })

  rawLog(payload)
}

function initLogstash (params) {
  if (!logstashHostAndPort) {
    debugError('not config SDK_logstash_host')
    return
  }

  let conf = logstashHostAndPort.split(':')
  if (conf.length !== 2) {
    debugError('SDK_logstash_host config error')
    return
  }

  createClient(parseInt(conf[1]), conf[0], {
    instanceId: process.env.HOSTNAME || 'sdk2-dev',
    appName: 'sdk2',
    HOSTNAME: process.env.HOSTNAME || 'sdk2-dev'
  })
}

module.exports = {
  log, initLogstash, error
}
