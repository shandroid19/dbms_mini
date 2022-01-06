var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate')
var config = require('../config')
var mysql = require('mysql')
var cors = require('./cors')


var con = mysql.createConnection({
    host: "localhost",
    user: config.username,
    password: config.password
  });

con.connect(function(err) { //to connect to the database 
    if (err) throw err;
    con.query("use social", function (err, result,fields) {
      if (err) throw err;
        console.log('using');
      });
router.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate,(req,res)=>{
    console.log(req.username)
    const sql = 'select * from post where username = ?'
    con.query(sql,[req.username],function (err,result,field){
        res.status(200).send(result);

    })
})
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into post(username,img,caption,private) values(?,?,?,?)'
    var values = [req.username,req.body.img,req.body.caption,req.body.private]
    con.query(sql,values,function (err,result,fields){
        console.log(result)
        res.status(200).json("successful");
    })
})

router.route('/:postid')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate,(req,res)=>{
    console.log(req.params.postid)
    const sql = 'select * from post where postid=?'
    con.query(sql,[req.params.postid],function (err,result){
        console.log(result)
        res.status(200).send(result[0]);
    })
})
.delete(cors.cors,authenticate,(req,res)=>{

    const sql = 'delete from post where postid=?'
    con.query(sql,[req.params.postid],function (err,result){
        console.log(result)
        res.status(200).json("successful");
    })
})
router.route('/:postid/comment')
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into comments(postid,comment,username) values(?,?,?) '
    con.query(sql,[req.params.postid,req.body.comment,req.username],function (err,result){
        console.log(result)
        console.log()
        res.status(200).json("successful");
    })
})
router.route('/comments/:commentid')
.delete(cors.cors,authenticate,(req,res)=>{
    const sql = 'delete from comments where commentid=?'
    con.query(sql,[req.params.commentid],function (err,result){
        console.log(result)
        console.log()
        res.status(200).json("successful");
    })
})

router.route('/:postid/like')
.get(cors.cors,authenticate,(req,res)=>{
    const sql = 'select * from likes where postid=?'
    con.query(sql,[req.params.postid],function (err,result){
        res.status(200).send(result[0]);
    })
})
router.route('/:postid/like')
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into likes values(?,?)'
    con.query(sql,[req.params.postid,req.username],function (err,result){
        res.status(200).json("successful");
    })
})
router.route('/:postid/like')
.delete(cors.cors,authenticate,(req,res)=>{
    const sql = 'delete from likes where username=?'
    con.query(sql,[req.username],function (err,result){
        res.status(200).json("successful");
    })
})
})
module.exports = router;
