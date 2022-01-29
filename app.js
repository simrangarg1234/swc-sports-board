const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
require("dotenv").config();

const url = "mongodb+srv://sports:board@data.tii7o.mongodb.net/sportsBoard";
//const url = process.env.MONGO_URI;
// const url = "mongodb://localhost:27017";
const baseUrl = process.env.baseUrl;
const PORT = process.env.PORT || 3000;

// Imported Routes
const teamRouter = require("./routes/team"),
  alumniRouter = require("./routes/alumni"),
  clubRouter = require("./routes/club"),
  userRouter = require("./routes/user"),
  adminRouter = require("./routes/admin"),
  eventsRouter = require("./routes/events"),
  facilityRouter = require("./routes/facility"),
  spardhaRouter = require("./routes/spardha");

const app = express();

const passportSetup = require("./config/passportsetup");

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
//checking whether connected successfully or not

const db = mongoose.connection;
db.on("error", console.error.bind(console.log("connecting...")));
db.once("open", () => {
  console.log("database connected");
});

app.use("/sports/public", express.static(__dirname + "/public"));
app.use("/sports/uploads", express.static(__dirname + "/uploads"));
app.use(methodOverride("_method"));
app.use(mongoSanitize());
app.use(
  session({
    secret: "Once again rusty is the cutest dog",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 },
  })
);

app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.session = req.session;
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.set("view engine", "ejs");

// Routes Setup
app.use(baseUrl, userRouter);
app.use(baseUrl + "/admin/events", eventsRouter);
app.use(baseUrl + "/admin/team", teamRouter);
app.use(baseUrl + "/admin/club", clubRouter);
app.use(baseUrl + "/admin/team", teamRouter);
app.use(baseUrl + "/admin/alumni", alumniRouter);
app.use(baseUrl + "/admin/facility", facilityRouter);
app.use(baseUrl + "/admin/spardha", spardhaRouter);
app.use(baseUrl + "/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
