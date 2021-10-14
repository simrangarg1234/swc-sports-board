const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Club = require('../models/club');
const { isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index')
var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}]);
var uploadhead=upload.fields([{name:'images',maxcount:1}]);

//Main page
router.get('/', async (req, res) => {
    Club.find({},(err,data)=>{
        // console.log("data",data)
        res.render('admin/club/index',{clubs:data});
    })
    
});

//Create Club:Post request
router.post('/create',async(req,res)=>{
    const data= req.body;

    console.log("Create Req.body",req.body);
    const club= await new Club({
        title:data.title,
        desc:data.desc
    })
    await club.save();
    res.redirect('/stud/gymkhana/sports/admin/club/')
})


//Add club :GET Request
router.get('/add', (req, res) => {
    res.render('admin/club/add');
});


//View:Update data
router.get('/view/:id',(req,res)=>{
    Club.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/club/view',{data})
    })
})

//View:Add heads->Get Request
router.get('/:clubid/add/head',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_heads',{data,idx:-1})
    })
})

//View:Add Heads Edit/First time adding->POST Request
router.post('/add/head',uploadhead,(req,res)=>{
    console.log("req.body/ head",req.body)
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
            // console.log('number',Number(req.body.idx))
            //data.heads[Number(req.body.idx)]=req.body.head;

            data.heads.splice(req.body.idx,1,head);
            
            console.log("data.heads",data.heads)
            
        }
        else{
            
            data.heads.push(head);
        } 
        data.save().then((record)=>{
            console.log("record",record)
            req.flash('success', 'head Addedd successfully!');
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        })
    })
})
//View :Add Achievements ->edit->GET request
router.get('/:clubid/edit/head/:idx',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_heads',{data,idx:req.params.idx})
    })
})
//View :Add Achievement ->delete->GET request
router.get('/:clubid/delete/head/:idx',(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.heads.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${req.params.clubid}`)
        })
    })
})





//View:Add Achievements->GET Request
router.get('/:clubid/add/achievement',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_achievements',{data,idx:-1})
    })
})

//View:Add Achievements Edit/First time adding->POST Request
router.post('/add/achievement',(req,res)=>{
    console.log("req.body/ achievement",req.body)
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            // console.log('number',Number(req.body.idx))
            //data.achievements[Number(req.body.idx)]=req.body.achievement;
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
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        })
    })
})
//View :Add Achievements ->edit->GET request
router.get('/:clubid/edit/achievement/:idx',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_achievements',{data,idx:req.params.idx})
    })
})
//View :Add Achievement ->delete->GET request
router.get('/:clubid/delete/achievement/:idx',(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.achievements.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${req.params.clubid}`)
        })
    })
})


//Info or What we do
//View:Add info->GET Request
router.get('/:clubid/add/info',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_info',{data,idx:-1})
    })
})

//View:Add info Edit/First time adding->POST Request
router.post('/add/info',(req,res)=>{
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
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        })
    })
})
//View :Add info ->edit->GET request
router.get('/:clubid/edit/info/:idx',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_info',{data,idx:req.params.idx})
    })
})
//View :Add info ->delete->GET request
router.get('/:clubid/delete/info/:idx',(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.info.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${req.params.clubid}`)
        })
    })
})

//Past Events
//View:Past events->GET Request
router.get('/:clubid/add/pe',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_pe',{data,idx:-1})
    })
})

//View:Add pe Edit/First time adding->POST Request
router.post('/add/pe',(req,res)=>{
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
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${data._id}`);
        })
    })
})
//View :Add pe ->edit->GET request
router.get('/:clubid/edit/pe/:idx',(req,res)=>{
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        res.render('admin/club/add_pe',{data,idx:req.params.idx})
    })
})
//View :Add pe ->delete->GET request
router.get('/:clubid/delete/pe/:idx',(req,res)=>{
    //console.log('req.params',req.params)
    Club.findOne({_id:req.params.clubid},(err,data)=>{
        data.pe.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${req.params.clubid}`)
        })
    })
})


//Save updated images and pdf/Score Card
router.post('/imgpdf',uploadval,(req,res)=>{
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        //pdf :Score Card
        if(req.files['pdf']){
            data.score=req.files['pdf'][0].path;
        }  
        //images: Gallery
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.gallery.push(req.files['images'][i].path);
            }
        }
        
        data.save().then(()=>{
            req.flash('success', 'Club Updated successfully!');
            res.redirect('/stud/gymkhana/sports/admin/club');
        })
    });
})

//Delete images by clicking on X :Sub part of View->images
router.get('/:id/delimg/:idx/',(req,res)=>{
    Club.findOne({_id:req.params.id}).then(data=>{
        data.gallery.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club/view/${req.params.id}`);
        })
    })
})




//For editing particular club
router.get('/:id/edit', catchAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)
    if (!club) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/stud/gymkhana/sports/admin/club');
    }
    res.render('admin/club/edit', { club });
}));
//For updating/Editing Title and Description
router.post('/edit',(req,res)=>{
    Club.findOne({_id:req.body.clubid}).then(data=>{
        data.title=req.body.title;
        data.desc= req.body.desc;
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/club`);
        })
    })
})

//Delete club    
router.get('/:id/delete/', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/stud/gymkhana/sports/admin/club');
}));

//Not using this. This is previously used for creating and updating data of club
router.post('/',uploadval, async (req, res) => {
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
    res.redirect('/stud/gymkhana/sports/admin/club/');
});


module.exports = router;