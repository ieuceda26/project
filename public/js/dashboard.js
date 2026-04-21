let currentRange = 'week';
let pieChart = null;

const CATEGORY_COLORS = {
  Food: '#52b788',
  Transport: '#f4a261',
  Entertainment: '#e76f51',
  Shopping: '#2d6a4f',
  Bills: '#457b9d',
  Health: '#a8dadc',
  Other: '#adb5bd',
};

// --- Range Toggle ---
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.dataset.range;
    loadAll();
  });
});

// --- Load everything ---
async function loadAll() {
  await Promise.all([loadSummary(), loadTransactions()]);
}

// --- Pie Chart ---
async function loadSummary() {
  const res = await fetch(`/api/transactions/summary?range=${currentRange}`);
  const data = await res.json();

  const noDataMsg = document.getElementById('no-data-msg');
  const canvas = document.getElementById('pieChart');

  if (!data.length) {
    noDataMsg.classList.remove('hidden');
    canvas.classList.add('hidden');
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }

  noDataMsg.classList.add('hidden');
  canvas.classList.remove('hidden');


  const labels = data.map(d => d.category);
  const values = data.map(d => parseFloat(d.total));
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#adb5bd');

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 13 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toFixed(2)}`,
          },
        },
      },
    },
  });
}

// --- Transaction List ---
async function loadTransactions() {
  const res = await fetch(`/api/transactions?range=${currentRange}`);
  const data = await res.json();
  const list = document.getElementById('transaction-list');
  
  if (!data.length) {
    list.innerHTML = '<li class="empty-msg">No transactions yet. Add one below!</li>';
    return;
  }

  list.innerHTML = data.map(t => `
    <li class="transaction-item">
      <div class="transaction-info">
        <span class="transaction-title">${t.title}</span>
        <span class="transaction-meta">${new Date(t.date).toLocaleDateString()} · <span class="category-tag">${t.category}</span></span>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount">$${parseFloat(t.amount).toFixed(2)}</span>
        <button class="btn-danger" onclick="deleteTransaction(${t.id})">✕</button>
      </div>
    </li>
  `).join('');
  
}

// --- Add Transaction ---
document.getElementById('add-btn').addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (!title || !amount || !category) {
    alert('Please fill in title, amount, and category.');
    return;
  }

  await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, amount: parseFloat(amount), category, date }),
  });

  // Clear form
  document.getElementById('title').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  document.getElementById('date').value = '';

  loadAll();
});

// --- Delete Transaction ---
async function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;
  await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
  loadAll();
}

// Init
loadAll();