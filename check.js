const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const aboutStart = html.indexOf('<section id="about"');
const eventsStart = html.indexOf('<!-- Events Section');
const aboutStr = html.substring(aboutStart, eventsStart);
const openDivs = (aboutStr.match(/<div\b/gi) || []).length;
const closeDivs = (aboutStr.match(/<\/div>/gi) || []).length;
console.log('Open:', openDivs, 'Close:', closeDivs);
