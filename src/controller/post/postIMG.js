// const upload = multer({
//   dest: "../Front/build/"
//   // you might also want to set some limits: https://github.com/expressjs/multer#limits
// });


export const postIMG = async (req, res) => {
    const tempPath = req.file.path;
  
    // if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    //   fs.rename(tempPath, targetPath, err => {
    //     if (err) return handleError(err, res);
  
    //     res
    //       .status(200)
    //       .contentType("text/plain")
    //       .end("File uploaded!");
    //   });
    // } else {
    //   fs.unlink(tempPath, err => {
    //     if (err) return handleError(err, res);
  
    //     res
    //       .status(403)
    //       .contentType("text/plain")
    //       .end("Only .png files are allowed!");
    //   });
    // }
  
    //if (path.extname(req.file.originalnmirr).toLowerCase() === ".png") {
    console.log("tempPath", tempPath);
    try {
      await fs.move(tempPath, "router/test.jpg");
      console.log("success!");
      res.status(200).contentType("text/plain").end("File uploaded!");
    } catch (err) {
      console.error(err);
    }
    //  fs.move(tempPath, destPath, err => {
    //   if (err) return handleError(err, res);
  
    //   res
    //     .status(200)
    //     .contentType("text/plain")
    //     .end("File uploaded!");
    // });
    // }
    // else {
    //   fs.unlink(tempPath, err => {
    //     if (err) return handleError(err, res);
  
    //     res
    //       .status(403)
    //       .contentType("text/plain")
    //       .end("Only .png files are allowed!");
    //   });
    // }
  };


export const test = async (req, res) => {
    var i = 1,
      max = 10;
  
    //set the appropriate HTTP header
    res.setHeader("Content-Type", "text/plain");
  
    res.write("hello1");
    //send multiple responses to the client
    // for (; i <= max; i++) {
    //   res.write('<h1>This is the response #: ' + i + '</h1>');
    //   await delay(1000);
    // }
    res.write("hello1");
    await delay(1000);
    res.write("hello2");
    await delay(1000);
    res.write("hello3");
    await delay(1000);
  
    //end the response process
    res.end("hello4");
  };
  
  const handleError = (err, res) => {
    res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
  };