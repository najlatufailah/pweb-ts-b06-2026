interface JenisAntrian {
  kode: string;
  nama: string;
  status: 'Aktif' | 'Tidak Aktif';
}

interface TiketAntrian {
  id: string;
  kodeLayanan: string;
  prioritas: 'Normal' | 'Lansia' | 'Disabilitas' | 'VIP';
  status: 'Menunggu' | 'Dipanggil' | 'Selesai' | 'Dilewati';
  waktu: string;
}

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SET USER DISPLAY NAME ---
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const greetingTitle = document.getElementById('greetingTitle');
  const userAvatar = document.getElementById('userAvatar');

  const rawUser = localStorage.getItem('user') || localStorage.getItem('username') || 'Admin';
  let displayName = 'Admin';

  if (rawUser) {
    try {
      const userObj = JSON.parse(rawUser);
      displayName = userObj.firstName || userObj.username || userObj.name || 'Admin';
    } catch {
      displayName = rawUser;
    }
  }

  if (userNameEl) userNameEl.textContent = displayName;
  if (greetingTitle) greetingTitle.textContent = 'Halo, ' + displayName;
  if (userRoleEl) userRoleEl.textContent = 'ADMIN';
  if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

  // --- 2. LOGOUT HANDLER ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }

  // --- 3. REALTIME CLOCK DINAMIS ---
  const clockDateEl = document.getElementById('clockDate');
  const clockTimeEl = document.getElementById('realtimeClock');
  
  function updateClock() {
    const now = new Date();
    const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (clockDateEl) clockDateEl.textContent = now.toLocaleDateString('id-ID', optionsDate);
    if (clockTimeEl) clockTimeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- 4. DATA INITIALIZATION ---
  let jenisAntrianList: JenisAntrian[] = [];
  try {
    const storedJenis = localStorage.getItem('jenisAntrian');
    if (storedJenis) {
      jenisAntrianList = JSON.parse(storedJenis);
    }
  } catch (err) {
    jenisAntrianList = [];
  }

  // Jika data di localStorage kosong/invalid, isi dengan data default
  if (!jenisAntrianList || jenisAntrianList.length === 0) {
    jenisAntrianList = [
      { kode: 'A', nama: 'Poli Umum', status: 'Aktif' },
      { kode: 'B', nama: 'Poli Gigi', status: 'Aktif' },
      { kode: 'C', nama: 'Poli KIA', status: 'Aktif' },
      { kode: 'F', nama: 'Farmasi', status: 'Aktif' },
      { kode: 'P', nama: 'Psikolog', status: 'Aktif' },
      { kode: 'U', nama: 'UGD', status: 'Aktif' }
    ];
    localStorage.setItem('jenisAntrian', JSON.stringify(jenisAntrianList));
  }

  let tiketList: TiketAntrian[] = [];
  try {
    const storedTiket = localStorage.getItem('tiketList');
    if (storedTiket) {
      tiketList = JSON.parse(storedTiket);
    }
  } catch (err) {
    tiketList = [];
  }

  // DOM Elements
  const formTambahLayanan = document.getElementById('formTambahLayanan') as HTMLFormElement;
  const inputKode = document.getElementById('inputKode') as HTMLInputElement;
  const inputNama = document.getElementById('inputNama') as HTMLInputElement;
  const tabelJenisAntrian = document.getElementById('tabelJenisAntrian') as HTMLElement;
  const selectJenisAntrianTiket = document.getElementById('selectJenisAntrianTiket') as HTMLSelectElement;

  // --- 5. METRICS UPDATE ---
  function updateMetrics() {
    const statTotalJenis = document.getElementById('statTotalJenis');
    const statAntrianAktif = document.getElementById('statAntrianAktif');
    const statSedangDipanggil = document.getElementById('statSedangDipanggil');
    const statTiketSelesai = document.getElementById('statTiketSelesai');

    if (statTotalJenis) statTotalJenis.textContent = String(jenisAntrianList.length);
    if (statAntrianAktif) statAntrianAktif.textContent = String(tiketList.filter(t => t.status === 'Menunggu').length);
    if (statSedangDipanggil) statSedangDipanggil.textContent = String(tiketList.filter(t => t.status === 'Dipanggil').length);
    if (statTiketSelesai) statTiketSelesai.textContent = String(tiketList.filter(t => t.status === 'Selesai').length);
  }

  // --- 6. RENDER DASHBOARD (TABLE & DROPDOWN) ---
  function renderDashboard() {
    if (tabelJenisAntrian) {
      tabelJenisAntrian.innerHTML = '';
    }

    if (selectJenisAntrianTiket) {
      selectJenisAntrianTiket.innerHTML = '<option value="">Pilih jenis antrian</option>';
    }

    jenisAntrianList.forEach((item, index) => {
      // Render Baris Tabel
      if (tabelJenisAntrian) {
        const row = document.createElement('tr');
        row.innerHTML = 
          '<td><strong>' + item.kode + '</strong></td>' +
          '<td>' + item.nama + '</td>' +
          '<td><span class="badge ' + (item.status === 'Aktif' ? 'badge-aktif' : 'badge-nonaktif') + '">' + item.status + '</span></td>' +
          '<td style="text-align: right;">' +
            '<button type="button" class="btn-text-action btn-toggle" data-index="' + index + '">' + (item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan') + '</button>' +
            '<button type="button" class="btn-text-action btn-hapus" data-index="' + index + '">Hapus</button>' +
          '</td>';
        tabelJenisAntrian.appendChild(row);
      }

      // Populate Dropdown Tiket Manual jika status Aktif
      if (item.status === 'Aktif' && selectJenisAntrianTiket) {
        const option = document.createElement('option');
        option.value = item.kode;
        option.textContent = item.nama + ' (' + item.kode + ')';
        selectJenisAntrianTiket.appendChild(option);
      }
    });

    localStorage.setItem('jenisAntrian', JSON.stringify(jenisAntrianList));
    renderRiwayatTiket();
    updateMetrics();
  }

  // --- 7. HANDLER TAMBAH JENIS ANTRIAN ---
  if (formTambahLayanan) {
    formTambahLayanan.addEventListener('submit', (e) => {
      e.preventDefault();
      const kode = inputKode.value.trim().toUpperCase();
      const nama = inputNama.value.trim();

      const regexKapital = /^[A-Z]$/;
      if (!regexKapital.test(kode)) {
        alert('Validasi Gagal: Kode antrian harus berupa tepat 1 huruf kapital (contoh: C)!');
        return;
      }

      const isDuplicate = jenisAntrianList.some(
        (item) => item.kode.toLowerCase() === kode.toLowerCase() || item.nama.toLowerCase() === nama.toLowerCase()
      );

      if (isDuplicate) {
        alert('Validasi Gagal: Kode atau Nama jenis antrian sudah terdaftar!');
        return;
      }

      jenisAntrianList.push({ kode, nama, status: 'Aktif' });
      renderDashboard();
      formTambahLayanan.reset();
      alert('Jenis antrian baru berhasil ditambahkan!');
    });
  }

  // --- 8. HANDLER AKSI TABEL (TOGGLE & HAPUS) ---
  if (tabelJenisAntrian) {
    tabelJenisAntrian.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      if (!btn) return;

      const index = Number(btn.getAttribute('data-index'));
      if (isNaN(index)) return;

      if (btn.classList.contains('btn-toggle')) {
        jenisAntrianList[index].status = jenisAntrianList[index].status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
        renderDashboard();
      } else if (btn.classList.contains('btn-hapus')) {
        if (confirm('Apakah Anda yakin ingin menghapus jenis layanan "' + jenisAntrianList[index].nama + '"?')) {
          jenisAntrianList.splice(index, 1);
          renderDashboard();
        }
      }
    });
  }

  // --- 9. HANDLER TERBITKAN TIKET MANUAL ---
  const formTerbitkanTiket = document.getElementById('formTerbitkanTiket') as HTMLFormElement;
  const selectPrioritas = document.getElementById('selectPrioritas') as HTMLSelectElement;

  if (formTerbitkanTiket) {
    formTerbitkanTiket.addEventListener('submit', (e) => {
      e.preventDefault();
      const kodeLayanan = selectJenisAntrianTiket.value;
      const prioritas = selectPrioritas.value as TiketAntrian['prioritas'];

      if (!kodeLayanan) {
        alert('Silakan pilih jenis antrian terlebih dahulu!');
        return;
      }

      const existingTickets = tiketList.filter((t) => t.id.startsWith(kodeLayanan + '-'));
      const nextNumber = existingTickets.length + 1;
      const ticketId = kodeLayanan + '-' + String(nextNumber).padStart(3, '0');
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newTiket: TiketAntrian = {
        id: ticketId,
        kodeLayanan,
        prioritas,
        status: 'Menunggu',
        waktu: timeString
      };

      tiketList.push(newTiket);
      localStorage.setItem('tiketList', JSON.stringify(tiketList));
      alert('Tiket manual berhasil diterbitkan dengan nomor: ' + ticketId);
      formTerbitkanTiket.reset();
      renderDashboard();
    });
  }

  // --- 10. HANDLER RESET ANTRIAN ---
  const btnResetAntrian = document.getElementById('btnResetAntrian');
  if (btnResetAntrian) {
    btnResetAntrian.addEventListener('click', () => {
      if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh antrian?')) {
        tiketList = [];
        localStorage.setItem('tiketList', JSON.stringify(tiketList));
        alert('Antrian berhasil direset!');
        renderDashboard();
      }
    });
  }

  // --- 11. RENDER RIWAYAT TIKET ---
  function renderRiwayatTiket() {
    const tabelRiwayat = document.getElementById('tabelRiwayatAntrian');
    if (!tabelRiwayat) return;
    tabelRiwayat.innerHTML = '';

    const recentTickets = [...tiketList].reverse().slice(0, 10);
    if (recentTickets.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 5;
      emptyCell.style.textAlign = 'center';
      emptyCell.style.color = '#777';
      emptyCell.style.padding = '12px';
      emptyCell.textContent = 'Belum ada tiket yang diterbitkan.';
      emptyRow.appendChild(emptyCell);
      tabelRiwayat.appendChild(emptyRow);
      return;
    }

    recentTickets.forEach((tiket, idx) => {
      const tr = document.createElement('tr');
      
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'badge badge-aktif';
      badgeSpan.textContent = tiket.status;

      const tdNo = document.createElement('td');
      tdNo.textContent = String(idx + 1);

      const tdId = document.createElement('td');
      const strongId = document.createElement('strong');
      strongId.textContent = tiket.id;
      tdId.appendChild(strongId);

      const tdPrioritas = document.createElement('td');
      tdPrioritas.textContent = tiket.prioritas;

      const tdWaktu = document.createElement('td');
      tdWaktu.textContent = tiket.waktu;

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(badgeSpan);

      tr.appendChild(tdNo);
      tr.appendChild(tdId);
      tr.appendChild(tdPrioritas);
      tr.appendChild(tdWaktu);
      tr.appendChild(tdStatus);

      tabelRiwayat.appendChild(tr);
    });
  }

  // PERINTAH UTAMA UNTUK RENDER
  renderDashboard();
});