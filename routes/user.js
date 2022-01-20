var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var config = require('../config')
var mysql = require('mysql');
var cors = require('./cors')
const authenticate = require('../authenticate');
// var cloudinary = require('cloudinary').v2;

// cloudinary.config({ 
//     cloud_name: config.cloud_name, 
//     api_key: config.api_key, 
//     api_secret: config.api_secret 
//   });

// cloudinary.uploader.destroy('y4zzvl0e8gk6n24gef15', function(result) { console.log(result,'done') });


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


      router.route('/')
      .post(cors.cors,(req,res)=>{
        const sql = 'select u.* , count(f.username),count(ff.username) from user u, followers f,followers ff where u.username=? and f.username=? and ff.follower = ?'
        con.query(sql,[req.body.username,req.body.username,req.body.username],(err,result)=>{
          if (err) res.status(500)
          resp =  {username:result[0].username,dp:result[0].dp,followers:result[0]['count(f.username)'],following:result[0]['count(ff.username)'],place:result[0].place,bio:result[0].bio,private:result[0].private,name:result[0].name}
          console.log(resp)
          res.status(200).json(resp)
      })

      });

    })
})

module.exports = router;
