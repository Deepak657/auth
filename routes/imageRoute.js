const multer = require("multer");
const router = require("express").Router();
const Image = require("../models/image");
const path = require("path");
const sharp = require("sharp");

// storage

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cd) => {
    cd(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
});

router.post("/", upload.single("testImage"), async (req, res) => {
  try {
    const newImage = new Image({
      name: req.body.name,
      image: {
        data: req.file.filename,
        contentType: "image/png",
      },
    });
    const compressedImageFileSavePath = path.join(
      __dirname,
      "../",
      "public",
      "images",
      new Date().getTime() + ".jpg"
    );
    sharp(req.file.filename)
      .resize(640, 480)
      .jpeg({
        quality: 80,
        chromaSubsampling: "4:4:4",
      })
      .toFile(compressedImageFileSavePath, (err, info) => {
        if (err) {
          res.send(err);
        } else {
          res.send(info);
        }
      });

    const savedImage = await newImage.save();
    res.send("successfully upoaded");
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
});

module.exports = router;
