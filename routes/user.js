var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var config = require('../config')
var mysql = require('mysql');
const authenticate = require('../authenticate');

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
      router.route('/follow')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'insert into followers values(?,?)';
        con.query(sql,[req.body.username,req.username],(err,result)=>{
            if (err) res.status(500);
              res.status(200).json("successful");
        })
      })

      router.route('/unfollow')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from followers where follower=? and username';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
              res.status(200).json("successful");
        })
      })

      router.route('/reject')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from requests where touser=? and fromuser=?';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
              res.status(200).json("successful");
        })
      })

      router.route('/accept')
      .post(cors.cors,authenticate,(req,res)=>{
        con.query('delete from requests where touser=? and fromuser=?',[req.username,req.body.username],(er,re)=>{
        if(er) throw res.status(500);
        const sql = 'insert into follower values(?,?)';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
              res.status(200).json("successful");
        })
      })
      })

      router.route('/request')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'insert into requests values(?,?)';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
              res.status(200).json("successful");
        })
      })

      router.route('/cancel')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from requests where touser=? and fromuser=?';
        con.query(sql,[req.body.username,req.username],(err,result)=>{
          if (err) res.status(500);
              res.status(200).json("successful");
        })
      })

      router.route('/search')
      .get(cors.cors,authenticate,(req,res)=>{
        const sql = 'select top 10 username,dp from user where username like ?%'
        con.query(sql,[req.body.username],(err,result)=>{
          if (err) res.status(500)
          res.status(200).json(result[0])
      })

      });
    })
})