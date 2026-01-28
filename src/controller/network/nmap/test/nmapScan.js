exec(`nmblookup -A ${data.ip}` , (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    data.hostname = stdout.split('\n')[1].split('<')[0];
  });