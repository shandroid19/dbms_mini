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
        console.log('using social database in posts');
      });

      router.route('/home')
      .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
      .post(cors.cors,authenticate,(req,res)=>{
          const sql = ' select post.*,user.dp from post inner join user on post.username=user.username where post.username in (select followers.username from followers where follower=?);'
        //   const sql = 'select * from post where username in (select username from followers where follower = ?)'
          con.query(sql,[req.username],function (err,result1,field){
            const sql2 = 'select count(*) as likes from likes where postid in (select postid from post where username in (select username from followers where follower=?)) group by postid;'
            con.query(sql2,[req.username],function (err,result2,field){
                var lis = []
                for(let i=0;i<result1.length;i++)
                {
                    var data = (Object.assign(result1[i],Object.assign({},result2[i])))
                    lis.push(data);
                }
                res.status(200).send(lis);
            })
          })
      })

router.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'select post.*,user.dp from post inner join user on user.username=post.username where post.username = ?  and (post.private=false or post.username in (select username from followers where follower=?)) order by post.created_at desc'
    con.query(sql,[req.body.username,req.username],function (err,result1,field){
        // const sql2 = 'select count(*) as likes from likes where postid in (select postid from post where username=? ) group by postid'
        // con.query(sql2,[req.body.username],function (err,result2,field){
        //     console.log(result1,result2)
        //     var lis = []
        //     for(let i=0;i<result1.length;i++)
        //     {
        //         var data = (Object.assign(result1[i],Object.assign({},result2[i])))
        //         lis.push(data);
        //     }
            // console.log(result1)
            res.status(200).send(result1);
        // })

    })
})


router.route('/hasliked')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'select count(*) as likes,case when exists(select * from likes where postid=? and username=?) then 1 else 0 end as hasliked from likes where postid=?'
    var values = [req.body.postid,req.username,req.body.postid]
    con.query(sql,values,function (err,result,fields){
        res.status(200).json(result[0]);
    })
})

router.route('/addpost')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into post(username,img,caption,private) values(?,?,?,?)'
    var values = [req.username,req.body.img,req.body.caption,req.body.private]
    con.query(sql,values,function (err,result,fields){
        console.log(result)
        res.status(200).json("successful");
    })
})

router.route('/post/:postid')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate,(req,res)=>{
    const sql = 'select post.*,user.dp from post inner join user on user.username=post.username where post.postid=? and (post.private=false or post.username in (select username from followers where follower=?))'
    // const sql = 'select post.*,user.dp from post,user where postid=? and username in (select username from user where username=)'
    // const sql = 'select * from post where postid=?'
    con.query(sql,[req.params.postid,req.username],function (err,result){
        console.log(result)
        res.status(200).send(result[0]);
    })
})
.delete(cors.cors,authenticate,(req,res)=>{

    const sql = 'delete from post where postid=?'
    con.query(sql,[req.params.postid],function (err,result){
        res.status(200).json("successful");
    })
})
router.route('/post/:postid/comment')
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into comments(postid,comment,username) values(?,?,?) '
    con.query(sql,[req.params.postid,req.body.comment,req.username],function (err,result){
      
        if (err) res.status(500);
        else
        res.status(200).json("successful");
    })
})
.get(cors.cors,authenticate,(req,res)=>{
    const sql = 'select *,dp from comments inner join user on comments.username=user.username where postid=?'
    con.query(sql,[req.params.postid],function (err,result){
        console.log(result,req.params.postid)
        if (err) res.status(500);
        else
        res.status(200).send(result);
    })
})

router.route('/post/:postid/likes')
.get(cors.cors,authenticate,(req,res)=>{
  const sql = 'select l.username,u.dp from likes l inner join user u on l.username=u.username where l.postid=?';
  con.query(sql,[req.params.postid],(err,result)=>{
    
    if (err) res.status(500);
    else
        res.status(200).send(result);
      })
})



router.route('/comments/:commentid')
.delete(cors.cors,authenticate,(req,res)=>{
    const sql = 'delete from comments where commentid=?'
    con.query(sql,[req.params.commentid],function (err,result){
     
        if (err) res.status(500);
        else
        res.status(200).json("successful");
    })
})

// router.route('/:postid/likess')
// .get(cors.cors,authenticate,(req,res)=>{
//     const sql = 'select * from likes where postid=?'
//     con.query(sql,[req.params.postid],function (err,result){
//         res.status(200).send(result[0]);
//     })
// })
router.route('/post/:postid/like')
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'insert into likes values(?,?)'
    con.query(sql,[req.params.postid,req.username],function (err){
        if(err) res.status(500).json({"message":"there was a porblem in the server"})
        
        else{
        const sql = 'select count(*) as likes,case when exists(select * from likes where postid=? and username=?) then 1 else 0 end as hasliked from likes where postid=?'
        var values = [req.body.postid,req.username,req.body.postid]
        con.query(sql,values,function (err,result,fields){
            res.status(200).json(result[0]);
        })}
    })
})
router.route('/post/:postid/dislike')
.post(cors.cors,authenticate,(req,res)=>{
    const sql = 'delete from likes where postid=? and username=?'
    con.query(sql,[req.params.postid,req.username],function (err){
        console.log(err)
        if(err) res.status(500).json({"message":"there was a porblem in the server"})
        else{
        const sql = 'select count(*) as likes,case when exists(select * from likes where postid=? and username=?) then 1 else 0 end as hasliked from likes where postid=?'
        var values = [req.body.postid,req.username,req.body.postid]
        con.query(sql,values,function (err,result,fields){
            res.status(200).json(result[0]);
        })
    }
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
