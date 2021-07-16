var users = require("../models/users");

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // render this
    return res.status(401).json({
      status: "Not authenticated",
      msg: "You are not authenticated !",
    });
  }
};

const isAdmin = (req, res, next) => {
  // const id = req.user.outlookId;
  // const user = await users.findOne({ id });

  // console.log("asd");
  if (req.user.isAdmin) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

module.exports = { isLoggedIn, isAdmin };
