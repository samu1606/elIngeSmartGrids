const SRK = "eyJhbG…1YAE";
const s = require('@supabase/supabase-js').createClient('https://ziwwfjpiegkxpflfpmxs.supabase.co', SRK);

async function main() {
  const { data: b, error } = await s.from('budgets').select('id, number, total, created_at').order('created_at', {ascending: false}).limit(3);
  if (error) { console.log('Error:', error.message); return; }
  for (const x of b) {
    const { data: items } = await s.from('budget_items').select('unit_price, quantity, total, pricing_mode, metros_por_salida').eq('budget_id', x.id);
    const sub = items?.reduce((a,i) => a + (i.total || 0), 0) || 0;
    const withIVA = Math.round(sub * 1.19);
    console.log(x.number, '| DB total:', x.total, '| items sum:', sub, '| should (19%):', withIVA);
  }
  require('fs').unlinkSync('./_check2.js');
}
main();
