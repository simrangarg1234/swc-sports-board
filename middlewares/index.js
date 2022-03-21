var users = require("../models/users");

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //   // render this
    return res.redirect("/stud/gymkhana/sports/login");
  }
};

const isAdmin = (req, res, next) => {
  // const id = req.user.outlookId;
  // const user = await users.findOne({ id });

  // console.log("asd");
  if (req.user.isAdmin) {
    return next();
  } else {
    return res.redirect("/stud/gymkhana/sports");
  }
};

//Multer
var storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname.split(" ").join("-") +
        "--" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storageEngine,
  fileFilter: (req, file, cb) => {
    // console.log('file.mimetype',file.mimetype)
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    )
      return cb(null, true);
    else return cb(new Error("ONly pdfs and images are allowed"), false);
  },
});

module.exports = { isLoggedIn, isAdmin, upload };
