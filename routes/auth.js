var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var config = require('../config')
var jwt = require('jsonwebtoken');
var cors = require('./cors')
var bcrypt = require('bcryptjs');
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
      });

    router.route('/checkname')
    .post(cors.corsWithOptions,(req,res)=>{
      var sql = "select * from user where username=?"
      con.query(sql,[req.body.username],(err,result)=>{
        if (result.length)
        res.status(200).send({taken:true})
        else
        res.status(200).send({taken:false})
        if (err) res.status(500).send({taken:false})
      })
    })

    router.route('/signup')
    .post(cors.corsWithOptions,(req, res)=>{
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        var sql = "insert into user values ( ?,?,?,?,?,?,?)"
        var values = [req.body.username,hashedPassword,req.body.name,req.body.bio,req.body.dp,req.body.private,req.body.place]

        con.query(sql,values,function (err, result,fields) {
        return new Promise((resolve,reject)=>{
            if (err) {
                return reject(err);
        }
        resolve(req.body.username)
        }).then((user, err)=>{

          const sql2 = 'insert into followers values(?,?)'
          con.query(sql2,[user,user],(err)=>{
            if (err) return res.status(500).send("There was a problem registering the user.")
            // create a token
            var token = jwt.sign({ username: user }, config.client_secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ auth: true, token: token });

          })
      })

        }) 
    }
);

router.post('/verify',cors.cors,authenticate, function(req, res) {
  res.status(200).send({auth:true,message:'logged in succesfully'})
  // var token = req.headers['x-access-token'];
  // console.log(req.headers.authorization)
  // if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  // jwt.verify(token, config.client_secret, function(err, decoded) {
  //   if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  //   else 
  //     res.status({auth:true,message:'successfully logged in'})
    // res.status(200).send(decoded);
  // });
});

router.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post('/delete',cors.cors,authenticate,function(req,res){
  con.query('delete from user where username=?',[req.username],function(err,result){
    if(err) res.status(500).send({"message":"not authenticated"})
    res.status(200).send({"message":"authenticated"})
  })
  
})

router.post('/login',cors.corsWithOptions, function(req, res) {
  con.query("select * from user where username=?",[req.body.username],function (err, result,fields) {
    return new Promise((resolve,reject)=>{
        if (err) {
            return reject(err);
    }
    console.log(result[0])
    resolve(result[0])
    }).then((user, err)=>{
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      // var passwordIsValid = bcrypt.compareSync(req.body.password,user.password);
      var passwordIsValid = bcrypt.compareSync(req.body.password,user.password);

      console.log(passwordIsValid)
      delete user.password
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      
      var token = jwt.sign({ id: user.username }, config.client_secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      
      res.status(200).send({ auth: true,
         token: token ,
         user: user
         });
  })

    }) 
});
})


module.exports = router;
