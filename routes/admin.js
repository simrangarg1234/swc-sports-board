const adminRouter = require("express").Router({ mergeParams: true });
const User = require("../models/users");
const { isAdmin, isLoggedIn } = require("../middlewares/index");
require("dotenv").config();
const baseUrl = process.env.BaseUrl;

adminRouter.get("/", isLoggedIn,isAdmin, function (req, res) {
  try {
    return res.redirect(baseUrl + "/admin/club/");
  } catch (e) {
    console.log(e.message);
  }
});

adminRouter.get("/users",isLoggedIn,isAdmin, async (req, res) => {
  const usersList = await User.find({});
  // console.log(usersList);
  res.render("admin/usersList", { usersList });
});

adminRouter.get("/users/delete/:id",isLoggedIn,isAdmin, async (req, res) => {
  const id = req.params.id;
  const user = await User.deleteOne({ outlookId: id });

  // console.log(usersList);
  res.render("admin/usersList", { usersList });
});

adminRouter.put("/users/:id",isLoggedIn,isAdmin, async function (req, res) {
  try {
    const id = req.params.id;

    const user = await User.findOne({ outlookId: id });
    if (!user) {
      res.status(404).json({ status: "Failed", message: "User not found!" });
    }

    var data;
    data = !user.isAdmin;

    await User.findOneAndUpdate({ outlookId: id }, { isAdmin: data });
    return res.redirect(baseUrl + "/admin/users");
  } catch (err) {
    console.log(err);
    return res
      .status(424)
      .json({ status: "Failed", message: "Request failed" });
  }
});
module.exports = adminRouter;
