var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var config = require('../config')
var mysql = require('mysql');
var cors = require('./cors')
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
        console.log('using social database in users');
      router.route('/follow')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'insert into followers values(?,?,1)';
        con.query(sql,[req.body.username,req.username],(err,result)=>{
            if (err) res.status(500);
              else
              res.status(200).json("successful");
        })
      })

      router.route('/followers')
      .get(cors.cors,authenticate,(req,res)=>{
        const sql = 'select f.follower,u.dp from followers f inner join user u on f.follower=u.username where f.username=?';
        con.query(sql,[req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json(result);
        })
      })

      router.route('/updatedetails')
      .put(cors.cors,authenticate,(req,res)=>{
        const sql = 'update user set dp=?,place=?,bio=? where username=?';
        con.query(sql,[req.body.dp,req.body.place,req.body.bio,req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json({message:'successful'});
        })
      })

      router.route('/followings')
      .get(cors.cors,authenticate,(req,res)=>{
        const sql = 'select f.username,u.dp from followers f inner join user u on f.username=u.username where f.follower=?';
        con.query(sql,[req.username],(err,result)=>{
          
          if (err) res.status(500);
          else
              res.status(200).send(result);
            })
      })

      router.route('/unfollow')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from followers where follower=? and username=?';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json("successful");
        })
      })

      router.route('/reject')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from followers where username=? and follower=?' ;
        // const sql = 'delete from requests where touser=? and fromuser=?';
        con.query(sql,[req.username,req.body.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json("successful");
        })
      })

      router.route('/accept')
      .post(cors.cors,authenticate,(req,res)=>{
        // con.query('delete from requests where touser=? and fromuser=?',[req.username,req.body.username],(er,re)=>{
        // if(er) throw res.status(500);
        const sql = 'delete from followers where username=? and follower=?' ;
        con.query(sql,[req.username,req.body.username],(err,result)=>{
         const sql = 'insert into followers values(?,?,1)';
           con.query(sql,[req.username,req.body.username],(err,result)=>{

            if (err) res.status(500);
            else
               res.status(200).json("successful");
           })
        })
      // })
      })

      router.route('/request')
      .post(cors.cors,authenticate,(req,res)=>{

        const sql = 'insert into followers values(?,?,0)';
        con.query(sql,[req.body.username,req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json("successful");
        })
      })

      router.route('/notifications')
      .post(cors.cors,authenticate,(req,res)=>{
        // const sql = 'insert into requests values(?,?)';
        const sql = 'select * from notifications where receiver=?';
        con.query(sql,[req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json(result);
        })
      }).delete(cors.cors,authenticate,(req,res)=>{
        // const sql = 'insert into requests values(?,?)';
        const sql = 'delete from notifications where receiver=?';
        con.query(sql,[req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json({"message":"successfully deleted notifications"});
        })
      })

      router.route('/removenotification')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from notifications where receiver=? and username=? and postid=? and type=?';
        con.query(sql,[req.body.receiver,req.body.username,req.body.postid,req.body.type],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json(result);
        })
      })

      router.route('/cancel')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'delete from followers where username=? and follower=?';
        con.query(sql,[req.body.username,req.username],(err,result)=>{
          if (err) res.status(500);
          else
              res.status(200).json("successful");
        })
      })

      router.route('/search')
      .post(cors.cors,(req,res)=>{
        const sql = 'select username,dp from user where username like ? limit 10'
        con.query(sql,req.body.username+'%',(err,result)=>{
          if (err) res.status(500)
          res.status(200).json(result)
      })

      });

      router.route('/recommendations')
      .get(cors.cors,authenticate,(req,res)=>{
        const sql = 'select username,dp,private from user where username not in (select username from followers where follower=?) limit 10'
        con.query(sql,[req.username],(err,result)=>{
          if (err) res.status(500)
          else
          res.status(200).json(result)
      })

      });

      router.route('/')
      .post(cors.cors,authenticate,(req,res)=>{
        const sql = 'select * from user where username =?'
        const sql1='select count(*) as followings from followers where follower=? and status=1'
        const sql2='select count(*) as followers from followers where username=? and status=1'
        con.query(sql,[req.body.username,req.body.username,req.body.username],(err,userresult)=>{
          const case1 = 'select case when exists(select * from followers where username=? and follower=? and status=0) then 3 '
          const case2 = 'when exists(select * from followers where username=? and follower=? and status = 1) then 1 '
          const case3 =  'when exists(select * from followers where username=? and follower=? and status = 0) then 2 '
          const case4 = 'else 0 end as status;'
          const thisuser = req.username
          const otheruser = req.body.username
          const values = [thisuser,otheruser,otheruser,thisuser,otheruser,thisuser]
          const sql = case1+case2+case3+case4
          con.query(sql,values,(err,result)=>{
          if (err) res.status(500)
          con.query(sql1,[req.body.username],(err,followingsresult)=>{
          con.query(sql2,[req.body.username],(err,followersresult)=>{
          resp =  {username:userresult[0].username,dp:userresult[0].dp,followers:followersresult[0].followers,following:followingsresult[0].followings,place:userresult[0].place,bio:userresult[0].bio,private:userresult[0].private,name:userresult[0].name,status:result[0].status}
          res.status(200).json(resp)
          })
          })
        })
      })

      });

    })
})

module.exports = router;
