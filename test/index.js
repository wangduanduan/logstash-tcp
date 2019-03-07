const logstash = require('../src/main')

logstash.init({
  host: '192.168.40.167',
  port: '9600'
})

let i = 0

setInterval(() => {
  logstash.send({
    hostname: 'wdd2',
    id: i++,
    something: {
      name: 'abc'
    }
  })
}, 1000)
