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
  (ejs = require("ejs")),
  (ejsMate = require("ejs-mate")),
  (flash = require("connect-flash")),
  (teamRouter = require("./routes/team")),
  (alumniRouter = require("./routes/alumni"));
clubRouter = require("./routes/club");
(userRouter = require("./routes/user")),
  (adminRouter = require("./routes/admin"));
facilityRouter = require("./routes/facility");
//  const  {upload}= require('./middlewares/index')
const url = "mongodb://localhost:27017/sports";
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

app.use("/", userRouter);
app.use("/admin/team", teamRouter);
app.use("/admin/club", clubRouter);
app.use("/admin", adminRouter);
app.use("/admin/team", teamRouter);
app.use("/admin/alumni", alumniRouter);
app.use("/admin/facility", facilityRouter);

app.get("/clubs/home", (req, res) => {
  res.render("clubs/home");
});
app.get('/clubs', (req, res) => {
  res.render('clubs/club');
});

app.get('/spardha', (req, res) => {
  res.render('spardha/view');
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
