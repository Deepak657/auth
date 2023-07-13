const router = require("express").Router();
const { auth } = require("./verifyToken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

router.get("/student", auth, async (req, res) => {
  const student = await Student.findOne({ _id: req.student._id });
  res.send(student);
});
router.get("/teacher", auth, async (req, res) => {
  const student = await Teacher.findOne({ _id: req.student._id });
  res.send(student);
});

module.exports = router;
