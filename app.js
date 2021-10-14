var express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors");
(path = require("path")),
  (session = require("express-session")),
  (cookieParser = require("cookie-parser")),
  (bodyParser = require("body-parser")),
  (methodOverride = require("method-override")),
  (passport = require("passport")),
  (multer = require("multer"));
(util = require("util")),
  (User = require("./models/users")),
  (Team) = require("./models/team"),
  (ejs = require("ejs")),
  (ejsMate = require("ejs-mate")),
  (flash = require("connect-flash")),
  (teamRouter = require("./routes/team")),
  (alumniRouter = require("./routes/alumni"));
clubRouter = require("./routes/club");
(userRouter = require("./routes/user")),
  (adminRouter = require("./routes/admin"));
eventsRouter = require("./routes/events");
facilityRouter = require("./routes/facility");
spardhaRouter = require("./routes/spardha");
//  const  {upload}= require('./middlewares/index')
const url = "mongodb+srv://sports:board@data.tii7o.mongodb.net/sportsBoard";
//const url = process.env.MONGO_URI;
const baseUrl = "/stud/gymkhana/sports";

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(
  url,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) console.log(err.message);
    else console.log("Successfully connected to DB!");
  }
);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.set("trust proxy", 1);

app.use(passport.initialize());
app.use(passport.session());

// app.get('/',(req,res)=>{
//   res.render('admin/club/index')
// })
app.get("/", (req, res) => res.redirect("/stud/gymkhana/sports"));

app.use("/stud/gymkhana/sports/admin/events", eventsRouter);
app.use("/stud/gymkhana/sports/admin/team", teamRouter);
app.use("/stud/gymkhana/sports/admin/club", clubRouter);
app.use("/stud/gymkhana/sports/admin/team", teamRouter);
app.use("/stud/gymkhana/sports/admin/alumni", alumniRouter);
app.use("/stud/gymkhana/sports/admin/facility", facilityRouter);
app.use("/stud/gymkhana/sports/admin/spardha", spardhaRouter);
app.use("/stud/gymkhana/sports/admin", adminRouter);

//Mini Club Pages
const Club = require("./models/club");
app.get("/stud/gymkhana/sports/clubs/:clubid/home", (req, res) => {
  Club.findOne({ _id: req.params.clubid }, (err, data) => {
    console.log("Club data", data);
    res.render("clubs/home", { club: data });
  });
});
//Home page for clubs
app.get("/stud/gymkhana/sports/clubs", (req, res) => {
  Club.find({}, (err, data) => {
    console.log("Club data", data);
    res.render("clubs/club", { data });
  });
  // res.render('clubs/club');
});

//Spardha
const Spardha = require('./models/spardha');
app.get("/stud/gymkhana/sports/spardha", (req, res) => {
  Spardha.find({}, (err, data) => {
    res.render("spardha/view", { data });
  }); 
});

app.get("/stud/gymkhana/sports/spardha/:year", (req, res) => {
  Spardha.findOne({Year: req.params.year}, (err, datas) => {
    res.render("spardha/past", { data: datas });
  }); 
});

app.get("/stud/gymkhana/sports/spardha/past/:yr", (req,res)=>{
  Spardha.find({}, (err, data) => {
    res.render(`spardha/spardha${req.params.yr}`, {data});
  });
});

app.all("/stud/gymkhana/sports/spardha", (req, res) => {
  Spardha.find({}, (err, data) => {
    res.render("spardha/spardhaNav", { data });
  });
});

//Alumni
const Alumni = require('./models/alumni');
app.get("/stud/gymkhana/sports/alumni", (req, res) => {
  Alumni.find({}, (err, data) => {
    res.render("alumni/view", { data });
  });
});



app.get('/stud/gymkhana/sports/teams', (req,res)=>{
  Team.find({}).sort( { priority: 1 } )
  .then((teams) => {
    res.render('teams/view',{ teams });
  });
});

const facilities = require('./models/facility');
app.get("/stud/gymkhana/sports/facilities", (req, res) => {
  facilities.find({}, (err, data) => {
    res.render("facilities/view", { data });
  }); 
});

// app.get('/facilities', (req, res) => {
//   res.render('facilities/view');
// });



app.use("/stud/gymkhana/sports/", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
