const router = require("express").Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");
const { auth } = require("./verifyToken");
const passport = require("passport");

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

  // checking if the student is already  in the database
  const emailExist = await Student.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("email already exist");

  //Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // create a new student

  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    fessPaid: req.body.fessPaid,
  });
  try {
    const savedstudent = await student.save();
    res.status(200).json({
      status: "success",
      data: {
        student: student._id,
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
  let result = await Student.findOne({ _id: req.user._id });
  if (!result) {
    result = await Teacher.findOne({ _id: req.user._id });
  }
  if (
    result.role !== "ADMIN" &&
    result.role !== "TEACHER" &&
    req.user._id !== req.params.id
  )
    return res.status(500).send("Only admin and teacher can access this route");

  // create updated student
  let student = {
    ...req.body,
  };
  if (result.role !== "ADMIN") {
    student = {
      ...req.body,
      fessPaid: false,
    };
  }

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      student,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log();
    res.status(200).json({
      status: "success",
      data: {
        updatedStudent,
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
  let result = await Student.findOne({ _id: req.user._id });
  if (!result) {
    result = await Teacher.findOne({ _id: req.user._id });
  }
  if (result.role !== "ADMIN")
    return res.status(500).send("Only admin can access this route");
  try {
    await Student.findByIdAndDelete(req.params.id);
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
  //Lets Validate the data before we a student
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // checking if the email exist
  const student = await Student.findOne({ email: req.body.email });
  if (!student) return res.status(400).send("email is not found");

  //password is correct

  const validPass = await bcrypt.compare(req.body.password, student.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //create and assign a token

  const token = jwt.sign({ _id: student._id }, process.env.TOKEN_SECRET);

  res
    .cookie("accessToken", token, {
      httpOnly: true,
    })
    .status(200)
    .send(token);
  // res.header("auth-token", token).send(token);
});

// router.post(
//   "/login",
//   passport.authenticate("local", { failureRedirect: "/login" }),
//   function (req, res) {
//     res.redirect("/");
//   }
// );
module.exports = router;
