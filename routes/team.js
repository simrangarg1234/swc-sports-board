const express = require('express');
var router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Team = require('../models/team');
const { isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);

router.get('/', async (req, res) => {
    const teams = await Team.find({}).sort({priority: 1});
    res.render('admin/team/index', {teams});
});

router.post('/', uploadval, async (req, res) => {
    const data = req.body; 
    const team = await new Team({
        priority: data.priority,
        name: data.name,
        position: data.position,
        hostel: data.hostel,
        contact1: data.contact1,
        contact2: data.contact2,
        email: data.email
    });
    team.image = req.files["images"][0].path;
    await team.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect('/stud/gymkhana/sports/admin/team');
});

router.get('/add', (req, res) => {
    res.render('admin/team/add');
});

router.get('/:id', catchAsync(async (req, res,) => {
    const team = await Team.findById(req.params.id);
    if (!team) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/stud/gymkhana/sports/admin/team');
    }
    res.render('admin/team/show', { team });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const team = await Team.findById(req.params.id)
    if (!team) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/stud/gymkhana/sports/admin/team');
    }
    res.render('admin/team/edit', { team });
}));
    
router.put('/:id', uploadval, catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let team = await Team.findByIdAndUpdate(id, {
        priority: data.priority,
        name: data.name,
        position: data.position,
        hostel: data.hostel,
        contact1: data.contact1,
        email: data.email
    }, {new: true});
    if(req.files){
        team.image = req.files["images"][0].path;
    }
    if(!team) return res.status(404).send('Member with the given id not found');
    req.flash('success', 'Member details updated!');
    res.redirect(`/stud/gymkhana/sports/admin/team`);
}));
    
router.get('/:id/delimg/',(req,res)=>{
    Team.findOne({_id:req.params.id}).then(data=>{
        data.image = null;
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/team/${req.params.id}/edit`);
        })
    })
});

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Team.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/stud/gymkhana/sports/admin/team');
}));

module.exports = router;