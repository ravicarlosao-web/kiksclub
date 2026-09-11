const r = await fetch('https://www.kicksclub.pt/api/health');
const data = await r.json();
console.log(JSON.stringify(data, null, 2));
