const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Club = require('../models/club');
const Gallery = require('../models/photogallery');
const { isAdmin,isLoggedIn } = require("../middlewares/index");
const {upload}= require('../middlewares/index')
var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}]);
require("dotenv").config();
const fs = require('fs');
var uploadhead=upload.fields([{name:'images',maxcount:1}]);

const baseUrl = process.env.BaseUrl;

//Main page
router.get('/', isLoggedIn,isAdmin, async (req, res) => {
    const data = await Club.find({});
    const gal = await Gallery.find({} , { clubGallery: 1});
    var gallery;
    if(gal.length != 0) {
        gallery = gal[0].clubGallery;
    }
    res.render('admin/club/index', {clubs:data,gallery});
});

//Add club :GET Request
router.get('/add', isLoggedIn,isAdmin,(req, res) => {
    res.render('admin/club/add');
});

//Create Club:Post request
router.post('/add',isLoggedIn,isAdmin,async(req,res)=>{
    const data= req.body;
    const club= await new Club({
        title:data.title,
        desc:data.desc
    });
    await club.save();
    res.redirect(baseUrl+'/admin/club/');
})

//For editing particular club
router.get('/:id/edit', isLoggedIn,isAdmin,catchAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)
    if (!club) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect(baseUrl+'/admin/club');
    }
    res.render('admin/club/edit', { club });
}));

//For updating/Editing Title and Description
router.post('/edit',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.body.clubid}).then(data=>{
        data.title=req.body.title;
        data.desc= req.body.desc;
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club`);
        })
    })
})

//Delete club    
router.get('/:id/delete/',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect(baseUrl+'/admin/club');
}));


//View:Update data
router.get('/view/:id',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/club/view',{data})
    })
})

router.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            for(let i=0;i<req.files['images'].length;i++){
                data.clubGallery.push(req.files['images'][i].path);
            }
            data.save().then((record)=>{
                console.log("record",record);
                res.redirect(baseUrl+'/admin/club/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/club/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                for(let i=0;i<req.files['images'].length;i++){
                    data[0].clubGallery.push(req.files['images'][i].path);
                }
                data[0].save().then((record)=>{
                    console.log("record",record);
                    res.redirect(baseUrl+'/admin/club/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/club/');
                });
            })
        }
        console.log(gallery);
    } else {
        res.redirect(baseUrl+'/admin/club/');
    }
});

router.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {clubGallery: 1},(err,data)=>{
        if (data[0].clubGallery!=null) {
            fs.unlink(`${data[0].clubGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data[0].clubGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/club`);
        })
    })
});

//View:Add heads->Get Request
router.get('/:clubid/add/head',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_heads',{data, idx:-1})
    })
})

//View:Add Heads Edit/First time adding->POST Request->POST Request
router.post('/add/head',isLoggedIn,isAdmin,uploadhead,(req,res)=>{
    //console.log("req.body/ head",req.body)
    var head={
        name:req.body.name,
        position:req.body.position,
        contact:req.body.contact,
        email:req.body.email
    }
    if(req.files['images']){
        head.image=req.files['images'][0].path
    }
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            data.heads.splice(req.body.idx,1,head);
        }
        else {
            data.heads.push(head);
        }
        
         
        data.save().then((record)=>{
            //console.log("record",record)
            req.flash('success', 'head Addedd successfully!');
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        })
    })
})

//View :Add Achievements ->edit->GET request
router.get('/:clubid/edit/head/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_heads',{data,idx:req.params.idx})
    })
})

//View:Add Achievements->GET Request
router.get('/:clubid/add/achievement',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_achievements',{data,idx:-1})
    })
})

//View :Delete Achievement ->delete->GET request
router.get('/:clubid/delete/head/:idx',isLoggedIn,isAdmin,(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.heads.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club/view/${req.params.clubid}`)
        })
    })
})

//View:Add Achievements Edit/First time adding->POST Request
router.post('/add/achievement',isLoggedIn,isAdmin,(req,res)=>{
    console.log("req.body/ achievement",req.body)
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            data.achievements.splice(req.body.idx,1,req.body.achievement);
            console.log("data.achievements",data.achievements)
        }
        else{
            data.achievements.push(req.body.achievement);
        } 
        data.save().then((record)=>{
            console.log("data.achievements2",data.achievements)
            console.log("record",record)
            req.flash('success', 'Achievement Addedd successfully!');
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        })
    })
})

//View :Edit Achievements ->GET request
router.get('/:clubid/edit/achievement/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_achievements',{data,idx:req.params.idx})
    })
})

//View :Add Achievement ->delete->GET request
router.get('/:clubid/delete/achievement/:idx',isLoggedIn,isAdmin,(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.achievements.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club/view/${req.params.clubid}`)
        })
    })
})


//Info or What we do
//View:Add info->GET Request
router.get('/:clubid/add/info',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_info',{data,idx:-1})
    })
})

//View:Add info Edit/First time adding->POST Request
router.post('/add/info',isLoggedIn,isAdmin,(req,res)=>{
    console.log("req.body/ info",req.body)
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            data.info.splice(req.body.idx,1,req.body.info);    
        }
        else{
            data.info.push(req.body.info);
        } 
        data.save().then((record)=>{
            console.log("info",data.info)
            console.log("record",record)
            req.flash('success', 'Achievement Addedd successfully!');
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        })
    })
})
//View :Add info ->edit->GET request
router.get('/:clubid/edit/info/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_info',{data,idx:req.params.idx})
    })
})
//View :Add info ->delete->GET request
router.get('/:clubid/delete/info/:idx',isLoggedIn,isAdmin,(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.info.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club/view/${req.params.clubid}`)
        })
    })
})

//Past Events
//View:Past events->GET Request
router.get('/:clubid/add/pe',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_pe',{data,idx:-1})
    })
})

//View:Add pe Edit/First time adding->POST Request
router.post('/add/pe',isLoggedIn,isAdmin,(req,res)=>{
    console.log("req.body/ pe",req.body)
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            data.pe.splice(req.body.idx,1,req.body.pe);    
        }
        else{
            data.pe.push(req.body.pe);
        } 
        data.save().then((record)=>{
            console.log("pe",data.pe)
            console.log("record",record)
            req.flash('success', 'Achievement Addedd successfully!');
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/club/view/${data._id}`);
        })
    })
})
//View :Add pe ->edit->GET request
router.get('/:clubid/edit/pe/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_pe',{data,idx:req.params.idx})
    })
})
//View :Add pe ->delete->GET request
router.get('/:clubid/delete/pe/:idx',isLoggedIn,isAdmin,(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.pe.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club/view/${req.params.clubid}`)
        })
    })
})


//Save updated images and pdf/Score Card
router.post('/imgpdf',isLoggedIn,isAdmin,uploadval,(req,res)=>{
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        //pdf :Score Card
        // if(req.files['pdf']){
        //     data.score=req.files['pdf'][0].path;
        // }  
        //images: Gallery
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.gallery.push(req.files['images'][i].path);
            }
        }
        
        data.save().then(()=>{
            req.flash('success', 'Club Updated successfully!');
            res.redirect(baseUrl+'/admin/club/view/'+req.body.clubid);
        })
    });
})

//Delete images by clicking on X :Sub part of View->images
router.get('/:id/delimg/:idx/',isLoggedIn,isAdmin,(req,res)=>{
    Club.findOne({_id:req.params.id}).then(data=>{
        if (data.gallery!=null) {
            fs.unlink(`${data.gallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data.gallery.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/club/view/${req.params.id}`);
        })
    })
})

//Not using this. This is previously used for creating and updating data of club
router.post('/',isLoggedIn,isAdmin,uploadval, async (req, res) => {
    const data = req.body;
    console.log('Req.body',req.body,"\n");
    // console.log('req.files',req.files,'\n')
    const club = await new Club({
        title:data.title,
        desc:data.desc,
        info:data.info,
        score:req.files['pdf'][0].path
    });
    
    for(let i=0;i<req.files['images'].length;i++){
        club.gallery.push(req.files['images'][i].path);
    }
    var temp={
        qstn:req.body.qstn,
        ans:req.body.ans
    }
    club.faq.push(temp);
    club.achievements.push(req.body.achievements);
    console.log("club",club)
    await club.save();
    req.flash('success', 'New Club added successfully!');
    res.redirect('admin/club/');
});

module.exports = router;