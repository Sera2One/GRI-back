export default function macExtractror(string) {
  try {
    //https://stackoverflow.com/questions/4260467/what-is-a-regular-expression-for-a-mac-address
    var r = /([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})/g;
    return string.match(r) ? string.match(r)[0] : " ";
  } catch (error) {
    return string;
  }
}

// Exemple
//  var text = "Invalid MAC: 3C-EF-8C-F8-5A-55, but valid: 00:11:22:33:44:55";
//  console.log(macExtractror(text));
