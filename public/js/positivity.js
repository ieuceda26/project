/*
Name: Isaac Euceda
Date: 2026/04/21
CSC 372-01
Description: This file contains the JavaScript code for the positivity page of the Save It application. It handles fetching and displaying a random quote, as well as allowing users to save their favorite quotes to local storage.
*/
// --- Quote ---
async function loadQuote() {
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  textEl.textContent = 'Loading...';
  authorEl.textContent = '';

  try {
    const res = await fetch('/api/quotes', { credentials: 'include' });
    const data = await res.json();
    textEl.textContent = `"${data.text}"`;
    authorEl.textContent = `— ${data.author}`;
  } catch {
    textEl.textContent = '"Small steps every day lead to big changes over time."';
    authorEl.textContent = '— Unknown';
  }
}

document.getElementById('new-quote-btn').addEventListener('click', loadQuote);

// --- Goals ---
async function loadGoals() {
  const res = await fetch('/api/goals', { credentials: 'include' });
  const goals = await res.json();
  const list = document.getElementById('goals-list');

  list.replaceChildren();

  if (!goals.length) {
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'empty-msg';
    emptyMsg.textContent = 'No goals yet. Set one below!';
    list.appendChild(emptyMsg);
    return;
  }

  goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100));
    const li = document.createElement('li');
    li.className = 'goal-item';
    
    const header = document.createElement('div');
    header.className = 'goal-header';
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'goal-title';
    titleSpan.textContent = g.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteGoal(g.id));
    
    header.appendChild(titleSpan);
    header.appendChild(deleteBtn);

    //amounts
    const amounts = document.createElement('span');
    amounts.className = 'goal-amounts';
    amounts.textContent = `$${parseFloat(g.saved_amount).toFixed(2)} saved of $${parseFloat(g.target_amount).toFixed(2)} - ${pct}%`;

    //progress bar
    const barBg = document.createElement('div');
    barBg.className = 'progress-bar-bg';
    const barFill = document.createElement('div');
    barFill.className = 'progress-bar-fill';
    barFill.style.setProperty('--fill', `${pct}%`);
    barBg.appendChild(barFill);

    li.appendChild(header);
    li.appendChild(amounts);
    li.appendChild(barBg);
    list.appendChild(li);
  });
}
// --- Add Goal ---
document.getElementById('add-goal-btn').addEventListener('click', async () => {
  const title = document.getElementById('goal-title').value.trim();
  const target = document.getElementById('goal-target').value;
  const saved = document.getElementById('goal-saved').value || 0;

  if (!title || !target) {
    alert('Please enter a goal title and target amount.');
    return;
  }

  await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, target_amount: parseFloat(target), saved_amount: parseFloat(saved) }),
  });

  document.getElementById('goal-title').value = '';
  document.getElementById('goal-target').value = '';
  document.getElementById('goal-saved').value = '';

  await loadGoals();
});

// --- Delete Goal ---
async function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  await fetch(`/api/goals/${id}`, { method: 'DELETE', credentials: 'include' });
  await loadGoals();
}

// Init
loadQuote();
loadGoals();