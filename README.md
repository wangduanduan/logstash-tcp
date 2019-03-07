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

# logstash.init(options) 全部配置

字段 | 类型 | 默认值 | 说明
--- | --- | --- | ----
socketTimeout | int | 10000 | socket超时毫秒数
port | int | | logstash tcp端口号
host | string | | | logstash IP地址
reconnectTimeout | int | 2000 | 发生异常时，多少毫秒后开始重连
maxReconnectTimes | int | 10 | 最多多少次重连
logBufferSize | int | 1000 | 当发生异常时，最多缓存多少个待发送的日志。当下次重连成功后，这些日志会再次尝试发送。

# logstash.send(msg)

msg是一个可以被序列化的对象。

```
logstash.send({
  key: 'what u want'
})
```


