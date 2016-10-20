var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js')
var logger = require('../logService.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: '首页'
  });
});

router.get('/reg', function (req, res) {
  res.render('reg', {
    title: '用户注册',
    req: req,
    res: res
  });
});

router.post('/reg', function (req, res) {
  //检验用户两次输入的口令是否一致
  if (req.body['password-repeat'] != req.body['password']) {
    req.session.error = '两次输入的口令不一致';
    return res.redirect('/reg');
  }
  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var newUser = new User({
    name: req.body.username,
    password: password
  });

  //检查用户名是否已经存在
  User.get(newUser.name, function (err, user) {
    if (user)
      err = 'Username already exists.';
    if (err) {
      req.session.error =  err;
      return res.redirect('/reg');
    }
    // 如果不存在则新增用户
    newUser.save(function (err) {
      if (err) {
        req.session.error =  err;
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.session.success = '注册成功';
      res.redirect('/');
    });
  });
});

router.get('/login/:username', function (req, res, next) {
  logger.ndump('username', req.params.username);
  res.send(req.params.username);
});

router.get('/helper', function (req, res) {
  res.render('helper', {
    title: 'Helper',
    _req: req,
    _res: res
  });
});

module.exports = router;
