var logger = require('../logService');
var settings = require('../settings');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var server = new Server(settings.host, '28017', {});

module.exports = new Db(settings.db, server);