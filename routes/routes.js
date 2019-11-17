var Post = require('../models/post');
var Apply = require('../models/applyjob');

module.exports = function (app, passport) {

    //หน้าหลัก
    app.get('/', function (req, res) {
        Post.find(function(err,docs){
            if(err){
                throw err;
            }else{
                res.render('index.ejs',{
                    post:docs
                }); 
            }
        });
         
    });

    //หน้าเข้าสู่ระบบ
    app.get('/login', function (req, res) {        
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    //ตัวจัดการเข้าสู่ระบบ
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    //หน้าสมัครสมาชิก
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
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
                res.render('profile.ejs',{
                    user: req.user,
                    post: docs            
                });
            }
        });
        
    });

    //หน้าสร้างงาน
    app.get('/create',isLoggedIn,function(req,res){
        res.render('createpost.ejs');
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
        });
        res.redirect('/profile')
    });   
    
    //แก้ไขงาน
    app.get('/edit/:id',isLoggedIn,function(req,res){       
        Post.find({_id:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else{
                res.render('edit.ejs',{
                    post:docs
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
                console.log(docs);
                res.redirect('/profile');
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
                    post:docs
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
                res.render('applyjob.ejs',{post:docs});
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
        });
        res.redirect('/');
    });

    //ดูรายชื่อผูุ้สมัครของงาน
    app.get('/candidate/:id',function(req,res){
        Apply.find({Jobref:req.params.id},function(err,docs){
            if(err){
                throw err;
            }else{
                res.send({
                    candidate:docs
                });
            }
        });         
    });

    //ออกจากระบบ
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

//เช็คว่าทำการเข้าสู่ระบบมาหรือยัง?
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}