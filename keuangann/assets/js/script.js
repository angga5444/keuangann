function formatRibuan(input) {
  if (!input) return;
  let val = input.value.replace(/[^\d]/g, '');
  if (val === '') { input.value = ''; return; }
  input.value = parseInt(val, 10).toLocaleString('id-ID');
}
function toNumber(str) {
  if (typeof str === 'number') return str;
  return parseFloat(String(str).replace(/\./g, '').replace(/,/g, '')) || 0;
}
function formatAngka(n) { return Number(n).toLocaleString('id-ID'); }


(function initTheme() {
  const saved = localStorage.getItem('kp_theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', saved);
  function applyButtonLabel(btn) {
    if (!btn) return;
    btn.textContent = (document.documentElement.getAttribute('data-bs-theme') === 'dark') ? '☀️ Mode Terang' : '🌙 Mode Gelap';
    btn.classList.toggle('btn-outline-light', true);
  }
  const btn = document.getElementById('themeToggle');
  applyButtonLabel(btn);
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-bs-theme');
      const next = (cur === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', next);
      localStorage.setItem('kp_theme', next);
      applyButtonLabel(btn);
    });
  }
})();

(function tipsHarian() {
  const el = document.getElementById('tipsHarian');
  if (!el) return;
  const tips = [
    "Sisihkan minimal 10% penghasilan untuk tabungan.",
    "Catat pengeluaran harian selama seminggu untuk evaluasi.",
    "Gunakan diskon hanya untuk kebutuhan, bukan keinginan.",
    "Bangun dana darurat 3–6x pengeluaran bulanan.",
    "Bayar hutang berbunga tinggi terlebih dahulu."
  ];
  el.textContent = tips[Math.floor(Math.random() * tips.length)];
})();

function showToast(message, type='info') {
  const container = document.getElementById('toastContainer');
  if (!container) return alert(message);
  const id = 'toast-' + Date.now();
  const bg = type === 'success' ? 'text-bg-success' : type === 'danger' ? 'text-bg-danger' : 'text-bg-primary';
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center ${bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `);
  const t = new bootstrap.Toast(document.getElementById(id), { delay: 2500 });
  t.show();
}


const store = {
  push(key, value) {
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(value);
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
  },
  all(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  },
  clear(key) { localStorage.removeItem(key); }
};

function renderRiwayatDiskon() {
  const ul = document.getElementById('riwayatDiskon');
  if (!ul) return;
  ul.innerHTML = '';
  const data = store.all('kp_diskon');
  if (data.length === 0) {
    ul.innerHTML = '<li class="list-group-item">Belum ada riwayat.</li>';
    return;
  }
  data.forEach((d, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>#{${i+1}} • Awal: Rp ${formatAngka(d.hargaAwal)} • Diskon: ${d.diskon}% • Akhir: Rp ${formatAngka(d.hargaAkhir)}</span>
      <span class="badge text-bg-secondary">${new Date(d.ts).toLocaleString('id-ID')}</span>
    `;
    ul.appendChild(li);
  });
}

function renderRiwayatTabungan() {
  const ul = document.getElementById('riwayatTabungan');
  if (!ul) return;
  ul.innerHTML = '';
  const data = store.all('kp_tabungan');
  if (data.length === 0) {
    ul.innerHTML = '<li class="list-group-item">Belum ada riwayat.</li>';
    return;
  }
  data.forEach((d, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>#{${i+1}} • Uang: Rp ${formatAngka(d.nominal)} • {${d.persen}}% • Tabung: Rp ${formatAngka(d.tabung)} • Sisa: Rp ${formatAngka(d.sisa)}</span>
      <span class="badge text-bg-secondary">${new Date(d.ts).toLocaleString('id-ID')}</span>
    `;
    ul.appendChild(li);
  });
}

function exportCSV(kind='diskon') {
  let rows = [];
  if (kind === 'diskon') {
    rows = [['Waktu','Harga Awal','Diskon %','Harga Akhir']];
    store.all('kp_diskon').forEach(d => rows.push([new Date(d.ts).toISOString(), d.hargaAwal, d.diskon, d.hargaAkhir]));
  } else {
    rows = [['Waktu','Nominal','Persen %','Ditabung','Sisa']];
    store.all('kp_tabungan').forEach(d => rows.push([new Date(d.ts).toISOString(), d.nominal, d.persen, d.tabung, d.sisa]));
  }
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `riwayat_${kind}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function hitungDiskon() {
  const hargaAwal = toNumber(document.getElementById('hargaAwal')?.value);
  const diskonUtama = parseFloat(document.getElementById('diskon')?.value.trim()) || 0;
  const diskonTambahan = parseFloat(document.getElementById('diskonTambahan')?.value.trim()) || 0;

  if (hargaAwal <= 0) return showToast('Harga awal tidak boleh 0 atau kosong.', 'danger');
  if (diskonUtama < 0 || diskonUtama > 100 || diskonTambahan < 0 || diskonTambahan > 100)
    return showToast('Nilai diskon harus antara 0% dan 100%.', 'danger');
  if (diskonUtama === 0 && diskonTambahan === 0)
    return showToast('Masukkan minimal satu nilai diskon.', 'danger');

  const hargaSetelahUtama = hargaAwal * (1 - diskonUtama / 100);
  const hargaAkhir = hargaSetelahUtama * (1 - diskonTambahan / 100);
  const potonganTotal = hargaAwal - hargaAkhir;
  const totalPersenEfektif = 100 - (hargaAkhir / hargaAwal * 100);

  document.getElementById('outputHargaAwal').innerText = 'Rp ' + formatAngka(hargaAwal);
  document.getElementById('outputDiskon').innerText = `${diskonUtama}% + ${diskonTambahan}%`;
  document.getElementById('outputHargaDiskon').innerText = 'Rp ' + formatAngka(potonganTotal);
  document.getElementById('hargaAkhir').innerText = 'Rp ' + formatAngka(hargaAkhir);

  if (window.dChart) window.dChart.destroy();
  const ctx = document.getElementById('chartDiskon');
  if (ctx) {
    window.dChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Potongan', 'Harga Akhir'],
        datasets: [{
          data: [potonganTotal, hargaAkhir],
          backgroundColor: ['#0d6efd', '#dc3545'], 
          hoverBackgroundColor: ['#0b5ed7', '#bb2d3b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => 'Rp ' + formatAngka(ctx.parsed)
            }
          }
        }
      }
    });
  }

  showToast(`Perhitungan selesai ✅ Diskon efektif: ${totalPersenEfektif.toFixed(2)}%`, 'success');
}


function refreshDiskon() {
  ['hargaAwal','diskon','diskonTambahan'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  ['outputHargaAwal','outputDiskon','outputHargaDiskon','hargaAkhir','outputHargaSetelahUtama','outputPotonganTambahan','outputHargaSetelahTambahan'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.innerText='Rp 0';
  });
  if(window.dChart){window.dChart.destroy();window.dChart=null;}
}
function simpanDiskon() {
  const hargaAwal = toNumber(document.getElementById('hargaAwal')?.value);
  const diskonUtama = parseFloat(document.getElementById('diskon')?.value.trim()) || 0;
  const diskonTambahan = parseFloat(document.getElementById('diskonTambahan')?.value.trim()) || 0;
  const hargaAkhir = toNumber(document.getElementById('hargaAkhir')?.innerText.replace(/[^\d]/g, '')) || 0;
  if (hargaAwal <= 0 || hargaAkhir <= 0) return showToast('Hitung dulu sebelum menyimpan.', 'danger');

  const rec = { hargaAwal, diskon: `${diskonUtama}+${diskonTambahan}`, hargaAkhir, ts: Date.now() };
  store.push('kp_diskon', rec);
  renderRiwayatDiskon();
  showToast('Disimpan ke riwayat ✅', 'success');

  fetch('php/simpan_diskon.php', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rec)
  }).catch(()=>{});
}

function hitungTabungan() {
  const nominal = toNumber(document.getElementById('nominalUang')?.value);
  const persen = toNumber(document.getElementById('persentaseTabung')?.value);
  if (nominal <= 0) return showToast('Nominal uang tidak boleh 0 atau kosong.', 'danger');
  if (persen < 0 || persen > 100) return showToast('Persentase harus antara 0% dan 100%.', 'danger');
  const tabung = (nominal * persen) / 100;
  const sisa = nominal - tabung;
  document.getElementById('outputNominalUang').innerText = 'Rp ' + formatAngka(nominal);
  document.getElementById('outputPersenTabung').innerText = persen + '%';
  document.getElementById('outputJumlahTabung').innerText = 'Rp ' + formatAngka(tabung);
  document.getElementById('outputSisaUang').innerText = 'Rp ' + formatAngka(sisa);
  // Chart
  if (window.tChart) window.tChart.destroy();
  const ctx = document.getElementById('chartTabungan');
  if (ctx) {
    window.tChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ditabung', 'Sisa Uang'],
        datasets: [{ data: [tabung, sisa] }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  showToast('Perhitungan tabungan selesai ✅', 'success');
}

function refreshKeuangan() {
  ['nominalUang','persentaseTabung'].forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
  document.getElementById('outputNominalUang').innerText = 'Rp 0';
  document.getElementById('outputPersenTabung').innerText = '0%';
  document.getElementById('outputJumlahTabung').innerText = 'Rp 0';
  document.getElementById('outputSisaUang').innerText = 'Rp 0';
  if (window.tChart) { window.tChart.destroy(); window.tChart = null; }
}

function simpanTabungan() {
  const nominal = toNumber(document.getElementById('nominalUang')?.value);
  const persen = toNumber(document.getElementById('persentaseTabung')?.value);
  const tabung = (nominal * persen) / 100;
  const sisa = nominal - tabung;
  if (nominal <= 0) return showToast('Hitung dulu sebelum menyimpan.', 'danger');
  const rec = { nominal, persen, tabung, sisa, ts: Date.now() };
  store.push('kp_tabungan', rec);
  renderRiwayatTabungan();
  showToast('Disimpan ke riwayat ✅', 'success');
  fetch('php/simpan_tabungan.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rec)
  }).catch(()=>{});
}

function hapusRiwayat(kind='diskon') {
  if (confirm('Hapus semua riwayat?')) {
    store.clear(kind === 'diskon' ? 'kp_diskon' : 'kp_tabungan');
    if (kind === 'diskon') renderRiwayatDiskon(); else renderRiwayatTabungan();
    showToast('Riwayat dihapus.', 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderRiwayatDiskon();
  renderRiwayatTabungan();
});
