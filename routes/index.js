var express = require('express');
var router = express.Router();
var logger = require('../logService.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: '首页'
  });
});

router.get('/reg',  function (req, res) {
  res.render('reg', {
    title: '用户注册'
  });
});

router.get('/login/:username', function (req, res, next) {
  logger.ndump('username', req.params.username);
  res.send(req.params.username);
});

router.get('/helper',  function(req, res) {
  res.render('helper', {
    title: 'Helper',
    _req: req,
    _res: res
  });
});

module.exports = router;
