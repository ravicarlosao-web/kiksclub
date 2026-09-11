// Test immediately - deploy should be done by now
const r = await fetch('https://www.kicksclub.pt/api/diag');
const text = await r.text();
console.log('Status:', r.status);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text.slice(0, 2000));
}
