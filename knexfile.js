require('@babel/register');

const dbConfig = require('./common-modules/server/config/database');

module.exports = Object.assign({}, dbConfig.default);