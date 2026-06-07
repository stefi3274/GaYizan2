// ════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════
Var SUPABASE_URL = 'https://bqfksgfzmiwgwrcgpkln.supabase.co';
Var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZmtzZ2Z6bWl3Z3dyY2dwa2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTQxMzIsImV4cCI6MjA5NDc5MDEzMn0.4HStTml7qtLm879-S-sbzOuYEKlVNS6ET3h-BmIJTQQ';
Var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ════════════════════════════════
// STATE GLOBAL
// ════════════════════════════════
Var S = {
  page: 'home', prev: null,
  products: [],
  myOrders: [],
  receivedOrders: [],
  profile: { name:'', whatsapp:'', moncash:'', natcash:'', sales_count:0 },
  homeCat: 'all',
  mktCat: 'all',
  emoji: '📚',
  detailId: null,
  user: null,
  vendorTab: 'products',
};