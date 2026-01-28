import nmap from "node-nmap";
import { exec } from "child_process";

export const scanIP = async (req, res) => {
  nmap.nmapLocation = "nmap"; //default
  var result = [];
  //    Accepts array or comma separated string of NMAP acceptable hosts
  //var quickscan = new nmap.QuickScan("192.168.200.1/24", "-sn");
  //var quickscan = new nmap.QuickScan("192.168.85.1/24", "-sn");
  //var quickscan = new nmap.nodenmap.OsAndPortScan('192.168.30.1/24');
  var quickscan = new nmap.QuickScan("192.168.200.1/24");
  //var quickscan = new nmap.OsAndPortScan('192.168.200.1/24');
  //var quickscan = new nmap.NmapScan('-Pn 192.168.200.1/24');

  quickscan.on("complete", function (allData) {
    //console.log(allData);
    var array = [];
    exec(`nbtscan -q 192.168.200.0-255` , (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      
      stdout.split('\n').forEach(element => {
          const ip = element.replace(/  +/g, ' ').split(' ')[0]
          const hostname = element.replace(/  +/g, ' ').split(' ')[1]
          //console.log('hostIP',ip);
          //console.log('hostName',hostname);
          array.push({ip: ip, hostname : hostname})
      });
      console.log("data !",array);
      allData.map((data) =>{
        array.map((data2)=>{
          //console.log("OB", data.ip);
          if(data.ip === data2.ip){
            data.hostname = data2.hostname;
          }
        } )
      return data;
      });

     
    const message = `Voici la liste des addresse IP scané.`;
    res.json({ message, data: allData })

    });
    
  });

  quickscan.on("error", function (error) {
    //console.log(error);
    const message = `Il y a une erreur lors de la scan.`;
    res.status(400).json({ message, data: error });
  });

  quickscan.startScan();
};

export const scanIP2 = async (req, res) => {
  nmap.nmapLocation = "nmap"; //default
  var result = [];
  //    Accepts array or comma separated string of NMAP acceptable hosts
  var quickscan = new nmap.QuickScan("192.168.200.1/24", "-O");
  //var quickscan = new nmap.QuickScan("192.168.85.1/24", "-sn");
  //var quickscan = new nmap.nodenmap.OsAndPortScan('192.168.30.1/24');

  quickscan.on("complete", function (allData) {
    //console.log("data !",allData); 
    const message = `Voici la liste des addresse IP scané.`;
    res.json({ message, data: allData });
  });

  quickscan.on("error", function (error) {
    //console.log(error);
    const message = `Il y a une erreur lors de la scan.`;
    res.status(400).json({ message, data: error });
  });

  quickscan.startScan();
};

export const analyzeIP = async (req, res) => {
  nmap.nmapLocation = "nmap"; //default
  var result = [];
  //    Accepts array or comma separated string of NMAP acceptable hosts
  //var quickscan = new nmap.QuickScan("192.168.200.217", "-sn");
  var quickscan = new nmap.QuickScan("192.168.85.148/24", "-sn");
  //var quickscan = new nmap.nodenmap.OsAndPortScan('192.168.30.1/24');

  quickscan.on("complete", function (data) {
    console.log(data);
    const message = `Voici la liste des addresse IP scané.`;
    res.json({ message, data: data });
  });

  quickscan.on("error", function (error) {
    console.log(error);
    const message = `Il y a une erreur lors de la scan.`;
    res.status(400).json({ message, data: error });
  });

  quickscan.startScan();
};

function delay(t, v) {
  return new Promise((resolve) => {
    setTimeout(resolve, t, v);
  });
}

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
