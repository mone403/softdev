var Post = require('../models/post');
var Apply = require('../models/applyjob');

module.exports = function (app, passport) {

    //หน้าหลัก
    app.get('/', function (req, res) {
        Post.find(function(err,docs){
            if(err){
                throw err;
            }else{
                res.send({
                    post:docs,
                    page:'index'
                }); 
            }
        });
         
    });

    //ค้นหางาน
   app.get('/search',function (req,res) {
        if(req.query.SearchJob && req.query.SearchPlace != "เลือกสถานที่"){
        Post.find({$and:[{Name:req.query.SearchJob},{Place:req.query.SearchPlace}]},function(err,job){
            if(err){
                throw err;;
            }else{
                res.send({
                    post:job,
                    page:search
                });
            }        
        });
        }else{
            Post.find({$or:[{Name:req.query.SearchJob},{Place:req.query.SearchPlace}]},function(err,job){
                if(err){
                    throw err;;
                }else{
                    res.send({
                        post:job,
                        page:'search'
                    });
                }        
            });

        }
   });

    //หน้าเข้าสู่ระบบ
    app.get('/login', function (req, res) {        
        res.send({ message: req.flash('loginMessage'),page:login });
    });

    //ตัวจัดการเข้าสู่ระบบ
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    //หน้าสมัครสมาชิก
    app.get('/signup', function (req, res) {
        res.send({ message: req.flash('signupMessage'),page:signup });
    });

    // ตัวจัดการการสมัครสมาชิก
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', //สมัครสมาชิกสำเร็จ
        failureRedirect: '/signup', //ถ้าสมัครสมาชิกไม่สำเร็จ
        failureFlash: true 
    }));

    //หน้าโปรไฟล์
    app.get('/profile', isLoggedIn, function (req, res) {            
        Post.find({Username:req.user.local.email},function(err,docs){
            if(err){
                throw err;
            }else{
                res.send({
                    user: req.user,
                    post: docs,
                    page:'profile'            
                });
            }
        });
        
    });

    //หน้าสร้างงาน
    app.get('/create',isLoggedIn,function(req,res){
        res.send({page:'createpost'});
        //console.log(req.user);    
        
    });

    //สร้างงาน
    app.post('/create',function(req,res){
        var newPost = new Post({
            Username: req.user.local.email,
            Name:req.body.Jobname,
            Owner:req.body.Jobowner,
            Type:req.body.Jobtype,
            Require:req.body.Jobrequire,
            Place:req.body.Jobplace,
            Time:req.body.Jobtime,
            Money:req.body.Jobmoney,
            People:req.body.Jobpeople,
            Detail:req.body.Jobdetail  
        });
        newPost.save(function(err){
            if(err)throw err;
            else{
                res.send({Status:'success'});
            }                        
        });
        res.send({Status:'failed'});
    });   
    
    //แก้ไขงาน
    app.get('/edit/:id',isLoggedIn,function(req,res){       
        Post.find({_id:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else{
                res.send({
                    post:docs,
                    page:'edit'
                });
            }
        }); 
        //res.send(req.params.id)
        
    });

    app.post('/edit/:id',isLoggedIn,function(req,res){
        const id = req.params.id;
        //console.log(id,req.body);
        Post.findOneAndUpdate({_id:id},{$set:{
            Name: req.body.Jobname,
            Owner:req.body.Jobowner,
            Type:req.body.Jobtype,
            Require:req.body.Jobrequire,
            Place:req.body.Jobplace,
            Time:req.body.Jobtime,
            Money:req.body.Jobmoney,
            People:req.body.Jobpeople,
            Detail:req.body.Jobdetail
        }}).then((docs)=>{
            if(docs){
                //console.log(docs);
                res.send({status:"success"});
            }            
        })
    });
    
    //ดูรายละเอียดของงาน
    app.get('/detail/:id',function(req,res){
        Post.find({_id:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else{
                res.send({
                    post:docs,
                    page:detail
                });
            }
        });         
    });

    //สมัครงาน
    app.get('/applyjob/:id',isLoggedIn,function(req,res){
        Post.find({_id:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else if(docs){
                res.send({post:docs,page:"applyjob"});
            }else{
                res.status(404);
            }
        });         
    });
    
    app.post('/applyjob/:id',isLoggedIn,function(req,res){
       const id = req.params.id;
        var newApply = new Apply({
            Jobref: id,
            Username: req.user.local.email,
            Firstname: req.body.firstname,
            Lastname: req.body.lastname,
            StudentID: req.body.stdid,
            Faculty: req.body.faculty,
            Major: req.body.major,
            Telephone: req.body.telephone,
            Facebook: req.body.facebook,
            LineID: req.body.lineid,
            State: 'Pending'
        });
        newApply.save(function(err){
            if(err) throw err;
            else{
                res.send({Status:"success"});
            }
        });
    });

    //ดูรายชื่อผูุ้สมัครของงาน
    app.get('/candidate/:id',function(req,res){
        Apply.find({Jobref:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else{
                Post.find({_id:req.params.id},function(err,job){
                    if(err){
                        throw err;
                    }else{
                        res.send({
                            candidate:docs,
                            post:job,
                            page:"candidate"
                        });
                    }
                    
                })
            }
            
        });     
    });

    //ออกจากระบบ
    app.get('/logout', function (req, res) {
        req.logout();
        res.send({status:"logout"});
    });
};

//เช็คว่าทำการเข้าสู่ระบบมาหรือยัง?
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.send({status:"not Login"});
}