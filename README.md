# UCCenter Rest API Server
TypeScript, ioredis, knex
Http1.0 8899포트
Http2.0 (추후 에정)

## Requirements
- Node.js >= 10.0

Redis, MariaDB 서버 주소 설정
- ./resources/config/release.json

## Debug (Watch typescrypt)

```sh
tsc --watch
```


## Run

```sh
npm install

node ./js/server.js
```

Open: http://localhost:8899
