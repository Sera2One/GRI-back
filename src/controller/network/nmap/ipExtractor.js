export default function ipExtractor(string) {
  try {
    //http://www.regular-expressions.info/examples.html
    var r =
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    return string.match(r) ? string.match(r)[0] : " ";
  } catch (error) {
    return string;
  }
}

// Exemple
// var text = "http://www.example.com/landing.aspx?referrer=10.11.12.13";
// console.log(ipExtractor(text));
