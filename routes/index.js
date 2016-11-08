var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var logger = require('../logService.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  Post.get( null, function (err, posts) {
    if (err) {
      posts = [];
    }

    res.render('index', {
      title: '首页',
      req: req,
      res: res,
      posts: posts
    });
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
  res.render('reg', {
    title: '用户注册',
    req: req,
    res: res
  });
});

router.post('/reg', checkNotLogin);
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
      logger.error(err);
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

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: '用户登入',
    res: res,
    req: req
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  // 生成口令的散列值
  var  md5 = crypto.createHash('md5');
  var  password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function (err, user) {
    if (!user) {
      req.session.error = '用户不存在';
      return  res.redirect('/login');
    }
    if (user.password != password) {
      req.session.error = '用户口令错误';
      return  res.redirect('/login');
    }
    req.session.user = user;
    req.session.success = '登入成功';
    res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout',  function (req, res) {
  req.session.user =  null;
  req.session.success = '登出成功';
  res.redirect('/');
});

router.post('/post', checkLogin);
router.post('/post',  function (req, res) {
  var  currentUser = req.session.user;
  var  post =  new  Post(currentUser.name, req.body.post);
  post.save(function (err) {
    if (err) {
      req.session.error = err;
      return  res.redirect('/');
    }
    req.session.success = '发表成功';
    res.redirect('/u/' + currentUser.name);
  });
});

router.get('/u/:user', function (req, res) {
  User.get(req.params.user,  function (err, user) {
    if (!user) {
      req.session.error = '用户不存在';
      return  res.redirect('/');
    }
    Post.get(user.name, function (err, posts) {
      if (err) {
        req.session.error = '用户不存在';
        return  res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        req: req,
        res: res,
        posts: posts
      });
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
    req: req,
    res: res
  });
});

function  checkLogin(req, res, next) {
  if (!req.session.user) {
    req.session.error = '未登入';
    return  res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.session.error = '已登入';
    return res.redirect('/');
  }
  next();
}

module.exports = router;
