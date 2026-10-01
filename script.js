document.addEventListener('DOMContentLoaded', () => {
  let medicines = JSON.parse(localStorage.getItem('app_meds')) || [];
  let currentFilter = 'all';

  const medForm = document.getElementById('med-form');
  const medList = document.getElementById('med-list');
  const dateDisplay = document.getElementById('date-display');
  const resetBtn = document.getElementById('reset-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Set today's formatted date
  if (dateDisplay) {
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  // Initial render on load
  render();

  // Add Medication Form Submit
  if (medForm) {
    medForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('name').value.trim();
      const dosageVal = document.getElementById('dosage').value.trim();
      const timeVal = document.getElementById('time').value;

      const newMed = {
        id: Date.now(),
        name: nameVal,
        dosage: dosageVal,
        time: timeVal,
        taken: false
      };

      medicines.push(newMed);
      saveAndRender();
      medForm.reset();
    });
  }

  // Event Delegation for Button Clicks
  if (medList) {
    medList.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('button');
      if (!targetBtn) return;

      const id = parseInt(targetBtn.getAttribute('data-id'), 10);
      if (!id) return;

      if (targetBtn.classList.contains('btn-action-remove')) {
        deleteMed(id);
      } else if (targetBtn.classList.contains('btn-action-taken')) {
        toggleTaken(id);
      }
    });
  }

  function toggleTaken(id) {
    medicines = medicines.map(med => {
      if (med.id === id) {
        return { ...med, taken: !med.taken };
      }
      return med;
    });
    saveAndRender();
  }

  function deleteMed(id) {
    medicines = medicines.filter(med => med.id !== id);
    saveAndRender();
  }

  // Reset Day Statuses
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (medicines.length === 0) return;
      if (confirm('Reset all medications to pending status for today?')) {
        medicines = medicines.map(med => ({ ...med, taken: false }));
        saveAndRender();
      }
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      render();
    });
  });

  // Save to LocalStorage and Render UI
  function saveAndRender() {
    localStorage.setItem('app_meds', JSON.stringify(medicines));
    render();
  }

  function render() {
    // 1. Update Dashboard Stats
    const total = medicines.length;
    const taken = medicines.filter(m => m.taken).length;
    const pending = total - taken;

    const statTotal = document.getElementById('stat-total');
    const statTaken = document.getElementById('stat-taken');
    const statPending = document.getElementById('stat-pending');

    if (statTotal) statTotal.textContent = total;
    if (statTaken) statTaken.textContent = taken;
    if (statPending) statPending.textContent = pending;

    // 2. Filter Medication Items
    const filtered = medicines.filter(med => {
      if (currentFilter === 'pending') return !med.taken;
      if (currentFilter === 'taken') return med.taken;
      return true;
    });

    // 3. Render Items to DOM
    if (!medList) return;
    medList.innerHTML = '';

    if (filtered.length === 0) {
      medList.innerHTML = `<div class="empty-msg">No medications found in this list.</div>`;
      return;
    }

    filtered.forEach(med => {
      const item = document.createElement('div');
      item.className = `med-item ${med.taken ? 'taken' : ''}`;

      item.innerHTML = `
        <div>
          <div class="med-name">${escapeHtml(med.name)}</div>
          <div class="med-details">
            <span>💊 ${escapeHtml(med.dosage)}</span>
            <span>•</span>
            <span>⏰ ${formatTime(med.time)}</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn-action-taken" data-id="${med.id}">
            ${med.taken ? '✓ Taken' : 'Mark Taken'}
          </button>
          <button class="btn-action-remove" data-id="${med.id}">
            🗑️ Remove
          </button>
        </div>
      `;

      medList.appendChild(item);
    });
  }

  // Helper Functions
  function formatTime(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  }
});