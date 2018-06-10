let express = require('express');
let router = express.Router();

router.get("/", function(req, res) {
    if(!req.session.admin){ 					//到达/admin路径首先判断是否已经登录
        req.session.error = "请先登录";
        res.redirect("/admin_login");				//未登录则重定向到 /admin_login 路径
    }
    //已登录则渲染admin页面
    res.render("admin", {
        title: "后台管理系统",
        admin: req.session.admin[0].aname
    })
});

router.route('/station_add').get(function (req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else {
        res.render('station_add', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/station_delete').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else{
        res.render('station_delete', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/station_edit').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else{
        res.render('station_edit', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/route_add').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else {
        res.render('route_add', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/route_delete').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else {
        res.render('route_delete', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/route_edit').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else {
        res.render('route_edit', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }
});

router.route('/user_edit').get(function(req, res) {
    if(!req.session.admin) {
        req.session.error = '请先登录';
        res.redirect('/admin_login');
    }
    else {
        res.render('user_edit', {
            title: '后台管理系统',
            admin: req.session.admin[0].aname
        });
    }

});

router.route('/getUser').get(function(req, res) {

    let connection = global.connection;
    console.log(req.query.type);
    if(req.query.type === 'search') {
        connection.query('SELECT * FROM user', function(err,result) {
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            if(result) {
                res.send(result);
            }
        });
    }
    if(req.query.type === 'delete') {
        connection.query(`DELETE FROM user where uname = '${req.query.uname}'`, function(err,result) {
            if(err) {
                console.log(err);
                res.sendStatus(500);
            }
            if(result) {
                res.sendStatus(200);
            }
        });
    }
});

module.exports = router;