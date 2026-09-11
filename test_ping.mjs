// Chama o /api/ping para ver diagnóstico detalhado
const r = await fetch('https://www.kicksclub.pt/api/ping');
const text = await r.text();
console.log('Status:', r.status);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text.slice(0, 1000));
}
