import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

const idx = c.indexOf("placeholder='Длительность'");
if (idx !== -1) {
  console.log("Found at", idx);
  console.log(JSON.stringify(c.substring(idx - 10, idx + 200)));
} else {
  // Search for the closing custom spell div
  const idx2 = c.indexOf('Длительность\' style=');
  console.log("Alt search:", idx2);
  if (idx2 !== -1) {
    console.log(JSON.stringify(c.substring(idx2 - 10, idx2 + 200)));
  }
}
