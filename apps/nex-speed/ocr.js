const Tesseract = require('tesseract.js');
import fs from 'fs';
import path from 'path';

const imgDir = path.join(__dirname, '../concept');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

// Only process the first few to test if it works well
async function processImages() {
  console.log(`Found ${files.length} images. Processing first 3...`);
  for (let file of files.slice(0, 3)) {
    console.log(`Processing ${file}...`);
    const { data: { text } } = await Tesseract.recognize(
      path.join(imgDir, file),
      'tha+eng',
      { logger: m => console.log(m.status) }
    );
    console.log(`\n--- ${file} ---`);
    console.log(text);
  }
}
processImages();
