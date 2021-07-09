//jshint esversion:6

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const app = express();

//home page
app.get("/", (req, res) => {
  res.render("admin/notice/index");
});




app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.listen(3000, () => {
    console.log('Serving on port 3000')
})


