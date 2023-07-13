const router = require("express").Router();
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerValidation, loginValidation } = require("../validation");
const { auth } = require("./verifyToken");
const Student = require("../models/Student");

router.post("/register", auth, async (req, res) => {
  // lets verify admin
  let result = await Student.findOne({ _id: req.user._id });
  if (!result) {
    result = await Teacher.findOne({ _id: req.user._id });
  }
  if (result.role !== "ADMIN")
    return res.status(500).send("Only admin can access this route");
  //Lets Validate the data before we a user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // checking if the user is already  in the database
  const emailExist = await Teacher.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("email already exist");

  //Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // create a new user

  const teacher = new Teacher({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedTeacher = await teacher.save();
    res.status(200).json({
      status: "success",
      data: {
        teacher: teacher._id,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
});

router.patch("/:id", auth, async (req, res) => {
  let result = await Teacher.findOne({ _id: req.user._id });
  if (!result) {
    result = await Student.findOne({ _id: req.user._id });
  }
  if (result.role !== "ADMIN" && req.user._id !== req.params.id)
    return res.status(500).send("Only admin and teacher can access this route");

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log();
    res.status(200).json({
      status: "success",
      data: {
        updatedTeacher,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  let result = await Teacher.findOne({ _id: req.user._id });
  if (!result) {
    result = await Student.findOne({ _id: req.user._id });
  }
  if (result.role !== "ADMIN")
    return res.status(500).send("Only admin can access this route");
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

router.post("/login", async (req, res) => {
  //Lets Validate the data before we a user
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // checking if the email exist
  const teacher = await Teacher.findOne({ email: req.body.email });
  if (!teacher) return res.status(400).send("email is not found");

  //password is correct

  const validPass = await bcrypt.compare(req.body.password, teacher.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //create and assign a token

  const token = jwt.sign({ _id: teacher._id }, process.env.TOKEN_SECRET);
  res
    .cookie("accessToken", token, {
      httpOnly: true,
    })
    .status(200)
    .send(token);
  // res.header("auth-token", token).send(token);
});

module.exports = router;
