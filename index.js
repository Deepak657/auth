const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const DB = process.env.DB_CONNECT;
const Student = require("./models/Student");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// connect to DB

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
  })
  .then(() => console.log("connection successful!"));
//import routes
const studentAuthRoute = require("./routes/studentAuth");
const teacherAuthRoute = require("./routes/teacherAuth");
const postRoute = require("./routes/posts");
const adminRoute = require("./routes/adminRoute");
const passwordReset = require("./routes/passwordReset");
const imageRoute = require("./routes/imageRoute");

// Middleware

app.use(express.json());
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      // Find the student with the given email
      const user = await Student.findOne({ email });
      if (!user) return done(null, false, { message: "Incorrect email." });
      // Check if the password is correct
      if (user.password !== password)
        return done(null, false, { message: "Incorrect password." });
      // Authentication succeeded
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await Student.findById(id);
//     done(null, user);
//   } catch (error) {
//     done();
//   }
// });

//Route Middlwares
app.use("/api/student", studentAuthRoute);
app.use("/api/teacher", teacherAuthRoute);
app.use("/api/admin", adminRoute);
app.use("/api/posts", postRoute);
app.use("/api/password-reset", passwordReset);
app.use("/api/imageUpload", imageRoute);
const port = 3000;

app.listen(port, () => console.log(`app running on port ${port}`));
