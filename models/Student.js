const { string, boolean } = require("joi");
const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    // maxlength: [40, "A tour name must have less or equal then 40 characters"],
    // minlength: [5, "A tour name must have more or equal then 5 characters"],
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  role: {
    type: String,
    enum: ["STUDENT", "ADMIN"],
    default: "STUDENT",
  },
  fessPaid: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

studentSchema.pre("save", function (next) {
  if (this.email === process.env.ADMIN_EMAIL) {
    this.role = "ADMIN";
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
