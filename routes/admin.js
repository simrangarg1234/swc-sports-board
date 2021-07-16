const adminRouter = require("express").Router({ mergeParams: true });
const User = require("../models/users");
const { isAdmin, isLoggedIn } = require("../middlewares/index");

adminRouter.get("/", isAdmin, function (req, res) {
  try {
    return res.render("admin/club/index");
  } catch (e) {
    console.log(e.message);
  }
});

adminRouter.get("/users", async (req, res) => {
  const usersList = await User.find({});
  // console.log(usersList);
  res.render("admin/usersList", { usersList });
});

adminRouter.put("/users/:id", async function (req, res) {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findOne({ outlookId: id });
    if (!user) {
      res.status(404).json({ status: "Failed", message: "User not found!" });
    }

    var data;
    data = !user.isAdmin;

    await User.findOneAndUpdate({ outlookId: id }, { isAdmin: data });
    return res.redirect("/admin/users");
  } catch (err) {
    console.log(err);
    return res
      .status(424)
      .json({ status: "Failed", message: "Request failed" });
  }
});
module.exports = adminRouter;
