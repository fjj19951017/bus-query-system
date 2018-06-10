let express = require('express');
let router = express.Router();

router.route('/').get(function(req,res) {    // 到达此路径则渲染login文件，并传出title值供 login.html使用
	res.render("login",{title:'用户登录'});
}).post(function(req,res) { 					   // 从此路径检测到post方式则进行post数据的处理操作
	//get User info
    let uname = req.body.uname;
    let upassword = req.body.upwd;
	let connection = global.connection;
	connection.query(`SELECT * FROM user WHERE uname='${uname}'`, function(err, result) {
	    if(err) {
            res.send(500);
            console.log(err);
        }
        else if(result.length === 0) {
            req.session.error = '用户名不存在';
            res.send(404);							//	状态码返回404
        }
        else {
	        if(upassword !== result[0].upassword) { 	//查询到匹配用户名的信息，但相应的password属性不匹配
                req.session.error = "密码错误";
                res.send(404);
            }
            else { 									//信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                req.session.user = result;
                res.send(200);
            }
        }
    });
});

/* GET register page. */
router.route("/register").get(function(req,res) {    // 到达此路径则渲染register文件，并传出title值供 register.html使用
	res.render("register",{title:'用户注册'});
}).post(function(req,res) {     // 从此路径检测到post方式则进行post数据的处理操作
    //get User info
    let uname = req.body.uname;
    let upassword = req.body.upwd;
    let connection = global.connection;
    connection.query(`SELECT * FROM user WHERE uname='${uname}'`, function(err, result) {
        if(err) {
            res.send(500);
            req.session.error =  '网络异常错误！';
        		console.log(err);
        }
        else if(result.length !== 0) {
        		req.session.error = '用户名已存在！';
        		res.send(500);
        }
        else {
            let addSql = 'INSERT INTO user(uname,upassword) VALUES(?,?)';
            let addSqlParams = [uname, upassword];
            connection.query(addSql,addSqlParams,function (err) {
                if (err) {
                    res.send(500);
                    console.log(err);
                }
                else {
                    req.session.error = '用户名创建成功！';
                    res.send(200);
                }
            });
        }
    });
});

/* GET index page. */
router.get("/index", function(req,res){
	if(!req.session.user){ 					//到达/home路径首先判断是否已经登录
		req.session.error = "请先登录";
		res.redirect("/");				//未登录则重定向到 /login 路径
	}
	res.render("index", {
	    title:'公交查询系统',
        user: req.session.user[0].uname
	});         //已登录则渲染home页面
});

router.route("/admin_login").get(function(req, res) {
    res.render("admin_login",{title:'系统管理员登录'});
}).post(function(req, res) {
    let aname = req.body.aname;
    let apassword = req.body.apwd;
    let connection = global.connection;
    connection.query(`SELECT * FROM admin WHERE aname='${aname}'`, function(err, result) {
        if(err) {
            res.send(500);
            console.log(err);
        }
        else if(result.length === 0) {
            req.session.error = '账号不存在';    //	状态码返回404
            res.send(404);
        }
        else {
            if(apassword !== result[0].apassword) { //查询到匹配用户名的信息，但相应的password属性不匹配
                req.session.error = "密码错误";
                res.send(404);
            }
            else {
                req.session.admin = result;
                res.send(200);
            }
        }
    });
});

/* GET logout page. */
router.get("/logout", function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
	req.session.user = null;
	req.session.error = null;
	res.redirect("/");
});

module.exports = router;
