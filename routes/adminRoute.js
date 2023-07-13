const router = require("express").Router();
const Student = require("../models/Student");
const { auth } = require("./verifyToken");

router.get("/students", auth, async (req, res, next) => {
  let result = await Student.findOne({ _id: req.student._id });
  if (!result) {
    result = await Teacher.findOne({ _id: req.student._id });
  }
  if (result.role !== "ADMIN")
    return res.status(500).send("Only admin can access this route");

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  try {
    const student = await Student.find().skip(skip).limit(limit);
    res.status(200).json({
      status: "success",
      results: student.length,
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
