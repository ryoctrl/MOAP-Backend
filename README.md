# MOAP-Backend
## About

This project is backend system of Mobile Order And Pay.

Using express framework without view engine, and provides API endpoints to MOAP frontend constructed by React.

## Usage

before run this projects, should install below applications to server.
- node.js
- pm2

```
$ git clone https://git.mosin.jp/git/mosin/MOAP-Backend.git
$ cd MOAP-Backend
$ npm i
$ cp .env.sample .env
// edit environment variables
$ pm2 start ecosystem.config.js
```

