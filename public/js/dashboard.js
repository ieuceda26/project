/*
Name:Isaac Euceda
Date: 2026/04/21
CSC-372-01
Description: This file contains the JavaScript code for the dashboard page of the Save It application. It handles fetching transaction data, rendering the pie chart and transaction list, and managing user interactions such as adding and deleting transactions.
*/

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

// — Range Toggle —
document.querySelectorAll('.toggle-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
currentRange = btn.dataset.range;
loadAll();
});
});

// — Load everything —
async function loadAll() {
await Promise.all([loadSummary(), loadTransactions()]);
}

// — Pie Chart —
async function loadSummary() {
const res = await fetch(`/api/transactions/summary?range=${currentRange}`, { credentials: 'include' });
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

// Wait for canvas to be visible before rendering
await new Promise(r => setTimeout(r, 0));

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

// — Transaction List —
async function loadTransactions() {
const res = await fetch(`/api/transactions?range=${currentRange}`, { credentials: 'include' });
const data = await res.json();
const list = document.getElementById('transaction-list');

while (list.firstChild) list.removeChild(list.firstChild);

if (!data.length) {
const empty = document.createElement('li');
empty.className = 'empty-msg';
empty.textContent = 'No transactions in this period.';
list.appendChild(empty);
return;
}

data.forEach(t => {
const li = document.createElement('li');
li.className = 'transaction-item';


const info = document.createElement('div');
info.className = 'transaction-info';

const title = document.createElement('span');
title.className = 'transaction-title';
title.textContent = t.title;

const meta = document.createElement('span');
meta.className = 'transaction-meta';
meta.textContent = `${new Date(t.date).toLocaleDateString()} · `;

const tag = document.createElement('span');
tag.className = 'category-tag';
tag.textContent = t.category;

meta.appendChild(tag);
info.appendChild(title);
info.appendChild(meta);

const right = document.createElement('div');
right.className = 'transaction-right';

const amount = document.createElement('span');
amount.className = 'transaction-amount';
amount.textContent = `$${parseFloat(t.amount).toFixed(2)}`;

const deleteBtn = document.createElement('button');
deleteBtn.className = 'btn-danger';
deleteBtn.textContent = '✕';
deleteBtn.addEventListener('click', () => deleteTransaction(t.id));

right.appendChild(amount);
right.appendChild(deleteBtn);

li.appendChild(info);
li.appendChild(right);
list.appendChild(li);


});
}
// — Add Transaction —
document.getElementById('add-btn').addEventListener('click', async () => {
const title = document.getElementById('title').value.trim();
const amount = document.getElementById('amount').value;
const category = document.getElementById('category').value;
const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];

if (!title || !amount || !category) {
alert('Please fill in title, amount, and category.');
return;
}

await fetch('/api/transactions', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title, amount: parseFloat(amount), category, date }),
});

document.getElementById('title').value = '';
document.getElementById('amount').value = '';
document.getElementById('category').value = '';
document.getElementById('date').value = '';

loadAll();
});

// — Delete Transaction —
async function deleteTransaction(id) {
if (!confirm('Delete this transaction?')) return;
await fetch(`/api/transactions/${id}`, { method: 'DELETE', credentials: 'include' });
loadAll();
}

// Init
loadAll();