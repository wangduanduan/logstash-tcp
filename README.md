# logstash-tcp 安装

```
yarn add logstash-tcp
```

# 使用方法

```js
const logstash = require('logstash-tcp')

logstash.init({
  host: '192.168.40.167',
  port: '9600'
})


logstash.send({
  hostname: 'wdd2',
  id: i++,
  something: {
    name: 'abc'
  }
})
```

# kibana查询结果

```json
{
  "_index": "logstash-2019.03.07",
  "_type": "logs",
  "_id": "AWlWzhwpixOdAdKBNE2p",
  "_score": null,
  "_source": {
    "hostname": "wdd2",
    "@timestamp": "2019-03-07T06:19:02.050Z",
    "port": 55666,
    "@version": "1",
    "host": "192.168.2.184",
    "id": 7,
    "something": {
      "name": "abc"
    },
    "tags": [
      "_grokparsefailure"
    ]
  },
  "fields": {
    "@timestamp": [
      1551939542050
    ]
  },
  "highlight": {
    "hostname": [
      "@kibana-highlighted-field@wdd2@/kibana-highlighted-field@"
    ]
  },
  "sort": [
    1551939542050
  ]
}
```