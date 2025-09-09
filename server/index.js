import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;


// Load flags dataset once
const flags = JSON.parse(
fs.readFileSync(new URL('./data/flags.json', import.meta.url))
);


function buildFlag({ name, code }) {
const image = `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
return { name, code, image };
}


function shuffle(arr) {
const a = [...arr];
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[a[i], a[j]] = [a[j], a[i]];
}
return a;
}


function pickRandom(arr, n) {
return shuffle(arr).slice(0, n);
}


// Get all flags (with image URLs)
app.get('/api/flags', (req, res) => {
res.json(flags.map(buildFlag));
});


// Get N random flags
app.get('/api/flags/random', (req, res) => {
let n = parseInt(req.query.count || '10', 10);
if (Number.isNaN(n) || n < 1) n = 10;
if (n > flags.length) n = flags.length;
res.json(pickRandom(flags, n).map(buildFlag));
});


// Single question (1 correct + 3 distractors)
app.get('/api/flags/question', (req, res) => {
const options = pickRandom(flags, 4);
const correct = options[0];
res.json({
image: `https://flagcdn.com/w320/${correct.code.toLowerCase()}.png`,
answer: correct.name,
options: shuffle(options.map(f => f.name))
});
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});