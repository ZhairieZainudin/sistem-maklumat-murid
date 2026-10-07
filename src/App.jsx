import React, { useState, useEffect } from 'react';
import { Search, Plus, FileDown, Upload, Trash2, Edit, Save, X, RefreshCw, CheckCircle, AlertCircle, AlertTriangle, LogOut, School, UserPlus, LogIn, Map } from 'lucide-react';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwHGt1qk9rWZy69XT1YgyAshR-faNwep9TvnZH8dc3Jw5IAFn1fO5oAkI_sHfd6ex0/exec';

const CustomDialog = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {type === 'alert' && <AlertCircle className="w-16 h-16 text-red-500 mb-4" />}
          {type === 'success' && <CheckCircle className="w-16 h-16 text-blue-500 mb-4" />}
          {type === 'confirm' && <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />}
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            {type === 'confirm' ? (
              <>
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Teruskan</button>
              </>
            ) : (
              <button onClick={onConfirm} className="w-full py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">Tutup</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [isSystemActive, setIsSystemActive] = useState(() => {
    const saved = localStorage.getItem('isSystemActive');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  
  const [regForm, setRegForm] = useState({ id: '', namaInstitusi: '', alamatInstitusi: '', daerah: '', kategoriSekolah: '' });

  const [activeTab, setActiveTab] = useState(1);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('isSystemActive', JSON.stringify(isSystemActive));
  }, [isSystemActive]);

  const fetchData = async () => {
    setIsLoading(true);
    setNotification('Menyemak Pangkalan Data...');
    try {
      const res = await fetch(GAS_URL);
      const result = await res.json();
      if(result.status === 'success') {
        setUsers(result.data.users || []);
        setStudents(result.data.students || []);
        setNotification('Data sedia.');
        setTimeout(() => setNotification(''), 2000);
      }
    } catch(e) {
      setNotification('Ralat menyemak data. Sila semak pautan Google Sheet.');
      setTimeout(() => setNotification(''), 3000);
    }
    setIsLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedId = loginId.replace(/\s+/g, '').toUpperCase();

    if(normalizedId === 'SUPERADMIN') {
      setCurrentUser({ id: 'SUPERADMIN', role: 'superadmin', namaInstitusi: 'SUPER ADMIN JAIPK' });
      setIsLoggedIn(true);
      setIsLoading(false);
      return;
    }

    if (!isSystemActive) {
      setDialog({ isOpen: true, type: 'alert', title: 'SISTEM DITUTUP', message: 'MAAF, SISTEM KUTIPAN DATA TELAH DITUTUP RASMI OLEH PIHAK PENGURUSAN.', onConfirm: () => setDialog({isOpen: false}) });
      setIsLoading(false);
      return;
    }

    const found = users.find(u => u.id === normalizedId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
    } else {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat Log Masuk', message: 'Kod Institusi tidak dijumpai. Sila daftar baharu atau semak kod anda.', onConfirm: () => setDialog({isOpen: false}) });
    }
    setIsLoading(false);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!isSystemActive) {
      setDialog({ isOpen: true, type: 'alert', title: 'SISTEM DITUTUP', message: 'Pendaftaran baharu tidak dibenarkan kerana sistem telah ditutup.', onConfirm: () => setDialog({isOpen: false}) });
      return;
    }
    
    setIsLoading(true);
    const normalizedId = regForm.id.replace(/\s+/g, '').toUpperCase();

    // INI ADALAH KOD PAKSAAN (VALIDATION) UNTUK KOD SEKOLAH
    // Mesti bermula dengan 3-4 Huruf (A-Z) dan diikuti 1-4 Nombor (0-9)
    const kodSekolahPattern = /^[A-Z]{3,4}\d{1,4}$/;
    
    if (normalizedId !== 'SUPERADMIN' && !kodSekolahPattern.test(normalizedId)) {
      setDialog({ 
        isOpen: true, 
        type: 'alert', 
        title: 'Format Kod Tidak Sah', 
        message: 'Pendaftaran ditolak! Sila masukkan Kod Sekolah yang betul bermula dengan huruf (Contoh: AXM1234, AZGA003). Penggunaan Nombor Kad Pengenalan adalah dilarang.', 
        onConfirm: () => setDialog({isOpen: false}) 
      });
      setIsLoading(false);
      return;
    }
    
    if(users.find(u => u.id === normalizedId) || normalizedId === 'SUPERADMIN') {
        setDialog({ isOpen: true, type: 'alert', title: 'Ralat Pendaftaran', message: 'ID Institusi (Kod Sekolah) ini telah wujud. Sila log masuk.', onConfirm: () => setDialog({isOpen: false}) });
        setIsLoading(false);
        return;
    }

    const newUser = {
        id: normalizedId,
        namaInstitusi: regForm.namaInstitusi.trim().toUpperCase(),
        alamatInstitusi: regForm.alamatInstitusi.trim().toUpperCase(),
        daerah: regForm.daerah,
        kategoriSekolah: regForm.kategoriSekolah,
        role: 'institusi'
    };

    try {
      const payload = { action: 'update_user', data: newUser };
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setUsers(prev => [...prev, newUser]);
      setDialog({ isOpen: true, type: 'success', title: 'Pendaftaran Berjaya', message: 'Institusi anda berjaya didaftarkan. Anda kini boleh log masuk menggunakan ID tersebut.', onConfirm: () => { setDialog({isOpen: false}); setIsRegistering(false); setRegForm({id:'', namaInstitusi:'', alamatInstitusi:'', daerah:'', kategoriSekolah:''}); } });
    } catch(e) {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat', message: 'Gagal mendaftar institusi. Sila cuba sebentar lagi.', onConfirm: () => setDialog({isOpen: false}) });
    }
    setIsLoading(false);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const formatMyKid = (value) => {
    const numbers = String(value || '').replace(/\D/g, '');
    if (numbers.length <= 6) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 6)}-${numbers.slice(6)}`;
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8, 12)}`;
  };

  const handleSaveStudent = async (studentData) => {
    showNotification('Menyimpan ke pangkalan data...');
    try {
      const payload = { action: 'update_student', data: studentData };
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setStudents(prev => {
        const exist = prev.find(s => String(s.mykid) === String(studentData.mykid));
        if(exist) return prev.map(s => String(s.mykid) === String(studentData.mykid) ? studentData : s);
        return [...prev, studentData];
      });
      setDialog({ isOpen: true, type: 'success', title: 'Berjaya', message: 'Data berjaya disimpan!', onConfirm: () => setDialog({isOpen: false}) });
    } catch(e) {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat', message: 'Gagal menyimpan rekod.', onConfirm: () => setDialog({isOpen: false}) });
    }
  };

  const handleDeleteStudent = async (mykid) => {
    showNotification('Memadam dari pangkalan data...');
    try {
      const payload = { action: 'delete_student', data: { mykid } };
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setStudents(prev => prev.filter(s => String(s.mykid) !== String(mykid)));
      showNotification('Rekod berjaya dipadam.');
    } catch(e) {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat', message: 'Gagal memadam rekod.', onConfirm: () => setDialog({isOpen: false}) });
    }
  };

  const handleSaveUser = async (userData) => {
    showNotification('Menyimpan institusi...');
    try {
      const payload = { action: 'update_user', data: userData };
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setUsers(prev => {
        const exist = prev.find(u => u.id === userData.id);
        if(exist) return prev.map(u => u.id === userData.id ? userData : u);
        return [...prev, userData];
      });
      setDialog({ isOpen: true, type: 'success', title: 'Berjaya', message: 'Institusi berjaya dikemaskini!', onConfirm: () => setDialog({isOpen: false}) });
    } catch(e) {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat', message: 'Gagal menyimpan institusi.', onConfirm: () => setDialog({isOpen: false}) });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const payload = { action: 'delete_user', data: { id } };
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      showNotification('Institusi dipadam.');
    } catch(e) {
      setDialog({ isOpen: true, type: 'alert', title: 'Ralat', message: 'Gagal memadam institusi.', onConfirm: () => setDialog({isOpen: false}) });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <CustomDialog {...dialog} />
        
        {/* Latar Belakang Biru Korporat */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-4 shadow-[0_0_40px_rgba(0,0,0,0.2)] flex items-center justify-center border-4 border-slate-100">
              <img src="174_05jatanegeriperak150ppi.png" alt="Logo Perak" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-center text-xl md:text-2xl font-extrabold text-white drop-shadow-md tracking-tight leading-snug mb-2 uppercase">Kutipan data Maklumat Murid B40 & Asnaf Institusi Pendidikan Islam Negeri Perak</h2>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/50">
            
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ID Pengguna (Kod Institusi)</label>
                  <input type="text" required value={loginId} onChange={(e) => setLoginId(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 font-mono text-lg transition-all bg-slate-50 uppercase" placeholder="Contoh: AXM0000" />
                </div>
                <div>
                  <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all">
                    <LogIn className="w-5 h-5"/> {isLoading ? 'Menyemak...' : 'Log Masuk Sistem'}
                  </button>
                </div>
                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Institusi anda belum mendaftar?</p>
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-700 font-bold hover:text-blue-800 hover:underline flex items-center justify-center gap-1 mx-auto w-full py-2 bg-blue-50 rounded-lg transition-colors mb-6">
                    <UserPlus className="w-4 h-4"/> Daftar Institusi Baharu
                  </button>
                  <div className="pt-4 mt-2 text-center border-t border-slate-100">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                       BAHAGIAN PENDIDIKAN, JABATAN AGAMA ISLAM PERAK
                     </p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterUser} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-1">
                   <h3 className="font-bold text-slate-800 text-lg">Pendaftaran Institusi</h3>
                   <button type="button" onClick={() => setIsRegistering(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5"/></button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kod Institusi (Mesti Huruf & Nombor)</label>
                  <input type="text" required value={regForm.id} onChange={(e) => setRegForm({...regForm, id: e.target.value.toUpperCase()})} className="block w-full px-4 py-2 border-2 border-slate-200 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 font-mono text-sm bg-slate-50 uppercase" placeholder="Contoh: AXM0000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Institusi</label>
                  <input type="text" required value={regForm.namaInstitusi} onChange={(e) => setRegForm({...regForm, namaInstitusi: e.target.value.toUpperCase()})} className="block w-full px-4 py-2 border-2 border-slate-200 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm bg-slate-50 uppercase" placeholder="Nama penuh sekolah..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Penuh Institusi</label>
                  <textarea required value={regForm.alamatInstitusi} onChange={(e) => setRegForm({...regForm, alamatInstitusi: e.target.value.toUpperCase()})} className="block w-full px-4 py-2 border-2 border-slate-200 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm bg-slate-50 uppercase" rows="2" placeholder="Alamat penuh..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daerah</label>
                  <select required value={regForm.daerah} onChange={(e) => setRegForm({...regForm, daerah: e.target.value})} className="block w-full px-4 py-2 border-2 border-slate-200 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm bg-slate-50">
                    <option value="">-- Pilih Daerah --</option>
                    <option value="BAGAN DATUK">BAGAN DATUK</option>
                    <option value="BAGAN SERAI">BAGAN SERAI</option>
                    <option value="BATU GAJAH">BATU GAJAH</option>
                    <option value="GERIK">GERIK</option>
                    <option value="IPOH">IPOH</option>
                    <option value="KAMPAR">KAMPAR</option>
                    <option value="KAMPONG GAJAH">KAMPONG GAJAH</option>
                    <option value="KUALA KANGSAR">KUALA KANGSAR</option>
                    <option value="LENGGONG">LENGGONG</option>
                    <option value="MANJUNG">MANJUNG</option>
                    <option value="MUALLIM">MUALLIM</option>
                    <option value="PARIT BUNTAR">PARIT BUNTAR</option>
                    <option value="PENGKALAN HULU">PENGKALAN HULU</option>
                    <option value="SELAMA">SELAMA</option>
                    <option value="SERI ISKANDAR">SERI ISKANDAR</option>
                    <option value="TAIPING">TAIPING</option>
                    <option value="TAPAH">TAPAH</option>
                    <option value="TELUK INTAN">TELUK INTAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Sekolah</label>
                  <select required value={regForm.kategoriSekolah} onChange={(e) => setRegForm({...regForm, kategoriSekolah: e.target.value})} className="block w-full px-4 py-2 border-2 border-slate-200 rounded-lg shadow-sm focus:ring-blue-600 focus:border-blue-600 text-sm bg-slate-50">
                    <option value="">-- Pilih --</option>
                    <option value="SEKOLAH MENENGAH AGAMA RAKYAT (AXM)">SEKOLAH MENENGAH AGAMA RAKYAT (AXM)</option>
                    <option value="MAAHAD TAHFIZ SWASTA (AZG)">MAAHAD TAHFIZ SWASTA (AZG)</option>
                    <option value="PENGAJIAN PONDOK SWASTA (AZA)">PENGAJIAN PONDOK SWASTA (AZA)</option>
                    <option value="SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)">SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)</option>
                    <option value="SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)</option>
                    <option value="SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)</option>
                    <option value="SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)">SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)</option>
                    <option value="SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)">SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)</option>
                    <option value="TADIKA ISLAM PERAK (AAK)">TADIKA ISLAM PERAK (AAK)</option>
                    <option value="TADIKA ISLAM SWASTA (AZS)">TADIKA ISLAM SWASTA (AZS)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all">
                    {isLoading ? 'Menyimpan...' : 'Hantar Pendaftaran'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <CustomDialog {...dialog} />
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-slate-900 text-white shadow-2xl flex-shrink-0 z-20 flex flex-col relative overflow-hidden">
        <div className="p-6 flex items-center gap-4 bg-slate-950/50 border-b border-slate-800 relative z-10">
          <div className="w-14 h-14 bg-white rounded-full p-1.5 shadow-lg flex items-center justify-center flex-shrink-0 border-2 border-slate-300">
             <img src="174_05jatanegeriperak150ppi.png" alt="Logo Perak" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-[11px] sm:text-xs font-bold leading-tight uppercase">
              KUTIPAN DATA MAKLUMAT MURID B40 & ASNAF<br/>
              INSTITUSI PENDIDIKAN ISLAM NEGERI PERAK
            </h1>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800/80 mb-2 border-b border-slate-700 relative z-10">
          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Log Masuk Sebagai:</p>
          <p className="font-bold text-sm truncate bg-slate-900 p-2 rounded-lg border border-slate-700/50 shadow-inner">{currentUser.namaInstitusi}</p>
          <div className="mt-3 flex justify-between items-center text-xs">
            <span className="bg-blue-900/50 px-2.5 py-1 rounded-md text-blue-200 font-mono border border-blue-800/50">{currentUser.id}</span>
            <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md font-bold uppercase">{currentUser.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto relative z-10">
          <button onClick={() => setActiveTab(1)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab===1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>Dashboard</button>
          <button onClick={() => setActiveTab(2)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab===2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>Senarai Maklumat Murid</button>
          
          {currentUser.role !== 'superadmin' && (
             <button onClick={() => setActiveTab(4)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab===4 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>Profil Institusi</button>
          )}

          {currentUser.role === 'superadmin' && (
            <>
              <div className="pt-4 mt-4 mb-2 border-t border-slate-700">
                <p className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider">Modul Superadmin</p>
              </div>
              <button onClick={() => setActiveTab(5)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab===5 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>Kawalan Institusi</button>
              <button onClick={() => setActiveTab(6)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab===6 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>Pelaporan & Statistik</button>
            </>
          )}
        </nav>
        
        <div className="p-4 bg-slate-950 border-t border-slate-800 mt-auto relative z-10 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-3">
             Unit Data dan Pembangunan, Bahagian Pendidikan, Jabatan Agama Islam Perak
          </p>
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 rounded-xl shadow-sm text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            <LogOut className="w-4 h-4"/> Log Keluar
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white shadow-sm border-b border-slate-200 z-10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
            {activeTab === 1 && "Dashboard"}
            {activeTab === 2 && "Senarai Maklumat Murid"}
            {activeTab === 4 && "Profil Institusi"}
            {activeTab === 5 && "Kawalan Institusi"}
            {activeTab === 6 && "Pelaporan & Statistik"}
          </h2>
          <button onClick={fetchData} className="ml-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Segar Semula Data">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </header>

        {notification && (
          <div className="absolute top-20 right-8 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
             <span className="font-medium text-sm">{notification}</span>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 1 && <TabDashboard students={students} currentUser={currentUser} isLoading={isLoading} />}
            {activeTab === 2 && <TabMaklumatMurid students={students} users={users} onSaveStudent={handleSaveStudent} onDeleteStudent={handleDeleteStudent} currentUser={currentUser} showNotification={showNotification} formatMyKid={formatMyKid} setDialog={setDialog} isLoading={isLoading} />}
            {activeTab === 4 && currentUser.role !== 'superadmin' && <TabProfilInstitusi currentUser={currentUser} onSaveUser={handleSaveUser} />}
            {activeTab === 5 && currentUser?.role === 'superadmin' && <TabKawalanPengguna users={users} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} isSystemActive={isSystemActive} setIsSystemActive={setIsSystemActive} setDialog={setDialog} isLoading={isLoading} />}
            {activeTab === 6 && currentUser?.role === 'superadmin' && <TabPelaporan students={students} users={users} isLoading={isLoading} />}
          </div>
        </main>
      </div>
    </div>
  );
}

const TabDashboard = ({ students, currentUser, isLoading }) => {
  const filtered = currentUser.role === 'superadmin' ? students : students.filter(s => s.kodInstitusi === currentUser.id);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Selamat Datang, {currentUser.namaInstitusi}</h2>
        <p className="text-slate-600 relative z-10">Sila gunakan menu di sebelah kiri untuk menguruskan data murid. Pastikan maklumat diisi dengan tepat dan terkini.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="bg-slate-200 rounded-2xl shadow-sm p-6 h-32 animate-pulse flex flex-col justify-center border border-slate-300">
             <div className="h-4 bg-slate-300 rounded w-2/3 mb-3"></div>
             <div className="h-10 bg-slate-300 rounded w-1/3"></div>
          </div>
        ) : (
          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden transform hover:-translate-y-1 transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <p className="text-blue-100 font-medium mb-1">Jumlah Murid Didaftar</p>
            <p className="text-4xl font-extrabold">{filtered.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabMaklumatMurid = ({ students, users, onSaveStudent, onDeleteStudent, currentUser, showNotification, formatMyKid, setDialog, isLoading }) => {
  const [filter, setFilter] = useState({ nama: '', mykid: '', tahun: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudentData, setCurrentStudentData] = useState({});
  const [dialogState, setDialogState] = useState({ isOpen: false, data: null });

  const isProfileIncomplete = currentUser.role !== 'superadmin' && (!currentUser.namaInstitusi || !currentUser.alamatInstitusi || !currentUser.daerah || !currentUser.kategoriSekolah);

  const showProfileAlert = () => {
    setDialog({ isOpen: true, type: 'alert', title: 'Profil Tidak Lengkap', message: 'Sila ke menu "Profil Institusi" dan lengkapkan maklumat (Alamat, Daerah & Kategori) sebelum menguruskan data murid.', onConfirm: () => setDialog({isOpen: false})});
  };

  const filtered = (currentUser.role === 'superadmin' ? students : students.filter(s => s.kodInstitusi === currentUser.id))
    .filter(s => String(s.nama || '').toLowerCase().includes(String(filter.nama || '').toLowerCase()))
    .filter(s => String(s.mykid || '').includes(String(filter.mykid || '')))
    .filter(s => String(s.tahun || '').toLowerCase().includes(String(filter.tahun || '').toLowerCase()));

  const handleExportCSV = () => {
    const header = ["No. MyKid/MyKad", "Nama_murid", "Tahun/Tingkatan", "Jantina", "Kategori B40", "Asnaf Fakir / Miskin", "Kod Sekolah", "Nama Sekolah", "Daerah"];
    const csvData = filtered.map(s => {
      const inst = users ? users.find(u => u.id === s.kodInstitusi) : null;
      const kodSekolah = s.kodInstitusi || '';
      const namaSekolah = inst ? inst.namaInstitusi : (currentUser.id === s.kodInstitusi ? currentUser.namaInstitusi : '');
      const daerahSekolah = inst ? inst.daerah : (currentUser.id === s.kodInstitusi ? currentUser.daerah : '');
      
      return [
        `"${s.mykid || ''}"`, `"${s.nama || ''}"`, `"${s.tahun || ''}"`, `"${s.jantina || ''}"`, `"${s.kategoriB40 || ''}"`, `"${s.kategoriFakirMiskin || ''}"`, `"${kodSekolah}"`, `"${namaSekolah}"`, `"${daerahSekolah}"`
      ];
    });
    const csvContent = [header, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Maklumat_Murid.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isProfileIncomplete) {
      showProfileAlert();
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      if (rows.length < 2) {
        setDialog({ isOpen: true, type: 'alert', title: 'Ralat Import', message: 'Fail CSV kosong atau format tidak sah.', onConfirm: () => setDialog({isOpen: false})});
        return;
      }
      
      let successCount = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',').map(item => item.replace(/(^"|"$)/g, '').trim());
        if (row.length >= 2 && row[0]) {
          const newStudent = {
            mykid: formatMyKid(row[0]),
            nama: row[1]?.toUpperCase() || '',
            tahun: row[2] || '',
            jantina: row[3] || 'Lelaki',
            kategoriB40: row[4] || '',
            kategoriFakirMiskin: row[5] || '',
            kodInstitusi: currentUser.id
          };
          onSaveStudent(newStudent);
          successCount++;
        }
      }
      setDialog({ isOpen: true, type: 'success', title: 'Import Selesai', message: `${successCount} rekod telah diproses.`, onConfirm: () => setDialog({isOpen: false})});
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleEdit = (s) => {
    if (isProfileIncomplete) {
      showProfileAlert();
      return;
    }
    setCurrentStudentData({...s});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (s) => {
    setDialogState({ isOpen: true, data: s });
  };

  const confirmDelete = () => {
    if(dialogState.data) {
      onDeleteStudent(dialogState.data.mykid);
    }
    setDialogState({ isOpen: false, data: null });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
      <CustomDialog isOpen={dialogState.isOpen} type="confirm" title="Padam Rekod" message={`Adakah anda pasti mahu memadam rekod untuk MyKid ${dialogState.data?.mykid}? Data tidak boleh dikembalikan.`} onConfirm={confirmDelete} onCancel={() => setDialogState({isOpen:false, data:null})} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Senarai Murid & Kategori</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { 
            if (isProfileIncomplete) {
              showProfileAlert();
              return;
            }
            setCurrentStudentData({ kodInstitusi: currentUser.id }); 
            setIsModalOpen(true); 
          }} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Tambah Rekod</button>
          <div className="relative">
            <input type="file" id="csv-upload-murid" accept=".csv" className="hidden" onChange={handleImportCSV} />
            <label htmlFor="csv-upload-murid" className="px-4 py-2 rounded-lg bg-slate-600 text-white font-semibold text-sm hover:bg-slate-700 shadow-sm flex items-center gap-2 cursor-pointer"><Upload className="w-4 h-4"/> Import CSV</label>
          </div>
          <button onClick={handleExportCSV} className="px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 shadow-sm flex items-center gap-2"><FileDown className="w-4 h-4"/> Eksport CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Cari Nama..." value={filter.nama} onChange={e=>setFilter({...filter, nama:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Cari MyKid..." value={filter.mykid} onChange={e=>setFilter({...filter, mykid:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Tahun/Tingkatan..." value={filter.tahun} onChange={e=>setFilter({...filter, tahun:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">MyKid</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Penuh</th>
              {currentUser.role === 'superadmin' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kod Sekolah</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Sekolah</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Daerah</th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tahun</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori B40</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asnaf</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-slate-50/50">
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                  {currentUser.role === 'superadmin' && (
                    <>
                      <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    </>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-5 bg-slate-200 rounded-full w-20"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-5 bg-slate-200 rounded-full w-20"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap text-right"><div className="h-6 bg-slate-200 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map(s => {
                const inst = users ? users.find(u => u.id === s.kodInstitusi) : null;
                return (
                  <tr key={s.mykid} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-900">{s.mykid}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{s.nama}</td>
                    {currentUser.role === 'superadmin' && (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold">{s.kodInstitusi}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{inst ? inst.namaInstitusi : '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{inst ? inst.daerah : '-'}</td>
                      </>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{s.tahun}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.kategoriB40 && s.kategoriB40 !== 'Bukan B40' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>{s.kategoriB40 || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(s.kategoriFakirMiskin === 'Fakir' || s.kategoriFakirMiskin === 'Miskin') ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>{s.kategoriFakirMiskin || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded hover:bg-blue-100 transition-colors"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteClick(s)} className="text-red-600 hover:text-red-900 mx-2 p-1 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={currentUser.role === 'superadmin' ? 9 : 6} className="px-4 py-8 text-center text-sm text-slate-500 italic">Tiada rekod dijumpai.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Maklumat Murid & Kategori</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">MyKid/MyKad</label>
                  <input type="text" placeholder="Contoh: 120101-08-1234" value={currentStudentData.mykid || ''} onChange={(e) => setCurrentStudentData({...currentStudentData, mykid: formatMyKid(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Penuh</label>
                  <input type="text" value={currentStudentData.nama || ''} onChange={(e) => setCurrentStudentData({...currentStudentData, nama: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun/Tingkatan</label>
                  <input type="text" value={currentStudentData.tahun || ''} onChange={(e) => setCurrentStudentData({...currentStudentData, tahun: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jantina</label>
                  <select value={currentStudentData.jantina || 'Lelaki'} onChange={(e) => setCurrentStudentData({...currentStudentData, jantina: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2 pt-4 border-t border-slate-100 mt-2">
                   <h4 className="text-sm font-bold text-blue-700 mb-4">KLASIFIKASI KATEGORI B40 & ASNAF</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori B40</label>
                        <select value={currentStudentData.kategoriB40 || ''} onChange={(e) => setCurrentStudentData({...currentStudentData, kategoriB40: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                          <option value="">-- Pilih --</option>
                          <option value="B1">B1 (Bawah RM2500)</option>
                          <option value="B2">B2 (RM2501 - RM3170)</option>
                          <option value="B3">B3 (RM3171 - RM3970)</option>
                          <option value="B4">B4 (RM3971 - RM4850)</option>
                          <option value="Bukan B40">Bukan B40</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Asnaf Fakir / Miskin</label>
                        <select value={currentStudentData.kategoriFakirMiskin || ''} onChange={(e) => setCurrentStudentData({...currentStudentData, kategoriFakirMiskin: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                          <option value="">-- Pilih --</option>
                          <option value="Fakir">Fakir</option>
                          <option value="Miskin">Miskin</option>
                          <option value="Bukan Asnaf">Bukan Asnaf</option>
                        </select>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => {
                if(!currentStudentData.mykid) return;
                onSaveStudent({...currentStudentData, kodInstitusi: currentStudentData.kodInstitusi || currentUser.id});
                setIsModalOpen(false);
              }} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm transition-colors">Simpan Rekod</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabProfilInstitusi = ({ currentUser, onSaveUser }) => {
  const [formData, setFormData] = useState({...currentUser});

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
           <School className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profil Institusi</h2>
          <p className="text-slate-500">Kemaskini maklumat asas institusi anda</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">ID Pengguna (Kod Institusi)</label>
          <input type="text" disabled value={formData.id} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed font-mono" />
          <p className="text-xs text-slate-400 mt-1">ID Pengguna tidak boleh diubah.</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nama Institusi</label>
          <input type="text" value={formData.namaInstitusi} onChange={(e) => setFormData({...formData, namaInstitusi: e.target.value.toUpperCase()})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Penuh Institusi</label>
          <textarea value={formData.alamatInstitusi || ''} onChange={(e) => setFormData({...formData, alamatInstitusi: e.target.value.toUpperCase()})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Daerah</label>
            <select value={formData.daerah} onChange={(e) => setFormData({...formData, daerah: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">-- Pilih Daerah --</option>
              <option value="BAGAN DATUK">BAGAN DATUK</option>
              <option value="BAGAN SERAI">BAGAN SERAI</option>
              <option value="BATU GAJAH">BATU GAJAH</option>
              <option value="GERIK">GERIK</option>
              <option value="IPOH">IPOH</option>
              <option value="KAMPAR">KAMPAR</option>
              <option value="KAMPONG GAJAH">KAMPONG GAJAH</option>
              <option value="KUALA KANGSAR">KUALA KANGSAR</option>
              <option value="LENGGONG">LENGGONG</option>
              <option value="MANJUNG">MANJUNG</option>
              <option value="MUALLIM">MUALLIM</option>
              <option value="PARIT BUNTAR">PARIT BUNTAR</option>
              <option value="PENGKALAN HULU">PENGKALAN HULU</option>
              <option value="SELAMA">SELAMA</option>
              <option value="SERI ISKANDAR">SERI ISKANDAR</option>
              <option value="TAIPING">TAIPING</option>
              <option value="TAPAH">TAPAH</option>
              <option value="TELUK INTAN">TELUK INTAN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Sekolah</label>
            <select value={formData.kategoriSekolah} onChange={(e) => setFormData({...formData, kategoriSekolah: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">-- Pilih --</option>
              <option value="SEKOLAH MENENGAH AGAMA RAKYAT (AXM)">SEKOLAH MENENGAH AGAMA RAKYAT (AXM)</option>
              <option value="MAAHAD TAHFIZ SWASTA (AZG)">MAAHAD TAHFIZ SWASTA (AZG)</option>
              <option value="PENGAJIAN PONDOK SWASTA (AZA)">PENGAJIAN PONDOK SWASTA (AZA)</option>
              <option value="SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)">SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)</option>
              <option value="SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)</option>
              <option value="SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)</option>
              <option value="SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)">SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)</option>
              <option value="SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)">SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)</option>
              <option value="TADIKA ISLAM PERAK (AAK)">TADIKA ISLAM PERAK (AAK)</option>
              <option value="TADIKA ISLAM SWASTA (AZS)">TADIKA ISLAM SWASTA (AZS)</option>
            </select>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button onClick={() => onSaveUser(formData)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Save className="w-5 h-5"/> Simpan Profil
          </button>
        </div>
      </div>
    </div>
  );
};

const TabKawalanPengguna = ({ users, onSaveUser, onDeleteUser, isSystemActive, setIsSystemActive, setDialog, isLoading }) => {
  const [filter, setFilter] = useState({ id: '', namaInstitusi: '', daerah: '', kategoriSekolah: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState({});
  const [dialogState, setDialogState] = useState({ isOpen: false, data: null });

  const filtered = users
    .filter(u => u.id !== 'SUPERADMIN')
    .filter(u => String(u.id || '').toLowerCase().includes(String(filter.id || '').toLowerCase()))
    .filter(u => String(u.namaInstitusi || '').toLowerCase().includes(String(filter.namaInstitusi || '').toLowerCase()))
    .filter(u => String(u.daerah || '').toLowerCase().includes(String(filter.daerah || '').toLowerCase()))
    .filter(u => String(u.kategoriSekolah || '').toLowerCase().includes(String(filter.kategoriSekolah || '').toLowerCase()));

  const handleEdit = (u) => {
    setCurrentUserData({...u});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (u) => {
    setDialogState({ isOpen: true, data: u });
  };

  const confirmDelete = () => {
    if(dialogState.data) {
      onDeleteUser(dialogState.data.id);
    }
    setDialogState({ isOpen: false, data: null });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
      <CustomDialog isOpen={dialogState.isOpen} type="confirm" title="Padam Institusi" message={`Memadam institusi ${dialogState.data?.id} akan menyebabkan mereka tidak boleh log masuk. Meneruskan?`} onConfirm={confirmDelete} onCancel={() => setDialogState({isOpen:false, data:null})} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Senarai & Kawalan Institusi</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-bold text-slate-700">Status Sistem:</span>
            <button onClick={() => setIsSystemActive(!isSystemActive)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isSystemActive ? 'bg-blue-500' : 'bg-red-500'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${isSystemActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md tracking-wider ${isSystemActive ? 'text-blue-700 bg-blue-100' : 'text-red-700 bg-red-100'}`}>{isSystemActive ? 'DIBUKA' : 'DITUTUP'}</span>
          </div>
          <button onClick={() => { setCurrentUserData({ id:'', namaInstitusi:'', alamatInstitusi:'', daerah:'', kategoriSekolah:'' }); setIsModalOpen(true); }} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Daftar Institusi Baharu</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="ID (Kod)..." value={filter.id} onChange={e=>setFilter({...filter, id:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Nama Institusi..." value={filter.namaInstitusi} onChange={e=>setFilter({...filter, namaInstitusi:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Daerah..." value={filter.daerah} onChange={e=>setFilter({...filter, daerah:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><input type="text" placeholder="Kategori..." value={filter.kategoriSekolah} onChange={e=>setFilter({...filter, kategoriSekolah:e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" /></div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Institusi</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Daerah</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-slate-50/50">
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td className="px-4 py-4 whitespace-nowrap text-right"><div className="h-6 bg-slate-200 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-bold text-blue-700">{u.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.namaInstitusi}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{u.daerah}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{u.kategoriSekolah}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded hover:bg-blue-100 transition-colors"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => handleDeleteClick(u)} className="text-red-600 hover:text-red-900 mx-2 p-1 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500 italic">Tiada institusi dijumpai.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Daftar Institusi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ID Pengguna (Kod Sekolah)</label>
                  <input type="text" placeholder="Cth: AXM0000" value={currentUserData.id || ''} onChange={(e) => setCurrentUserData({...currentUserData, id: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Institusi</label>
                  <input type="text" value={currentUserData.namaInstitusi || ''} onChange={(e) => setCurrentUserData({...currentUserData, namaInstitusi: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Penuh Institusi</label>
                  <textarea value={currentUserData.alamatInstitusi || ''} onChange={(e) => setCurrentUserData({...currentUserData, alamatInstitusi: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows="2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Daerah</label>
                  <select value={currentUserData.daerah || ''} onChange={(e) => setCurrentUserData({...currentUserData, daerah: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- Pilih Daerah --</option>
                    <option value="BAGAN DATUK">BAGAN DATUK</option>
                    <option value="BAGAN SERAI">BAGAN SERAI</option>
                    <option value="BATU GAJAH">BATU GAJAH</option>
                    <option value="GERIK">GERIK</option>
                    <option value="IPOH">IPOH</option>
                    <option value="KAMPAR">KAMPAR</option>
                    <option value="KAMPONG GAJAH">KAMPONG GAJAH</option>
                    <option value="KUALA KANGSAR">KUALA KANGSAR</option>
                    <option value="LENGGONG">LENGGONG</option>
                    <option value="MANJUNG">MANJUNG</option>
                    <option value="MUALLIM">MUALLIM</option>
                    <option value="PARIT BUNTAR">PARIT BUNTAR</option>
                    <option value="PENGKALAN HULU">PENGKALAN HULU</option>
                    <option value="SELAMA">SELAMA</option>
                    <option value="SERI ISKANDAR">SERI ISKANDAR</option>
                    <option value="TAIPING">TAIPING</option>
                    <option value="TAPAH">TAPAH</option>
                    <option value="TELUK INTAN">TELUK INTAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori Sekolah</label>
                  <select value={currentUserData.kategoriSekolah || ''} onChange={(e) => setCurrentUserData({...currentUserData, kategoriSekolah: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- Pilih --</option>
                    <option value="SEKOLAH MENENGAH AGAMA RAKYAT (AXM)">SEKOLAH MENENGAH AGAMA RAKYAT (AXM)</option>
                    <option value="MAAHAD TAHFIZ SWASTA (AZG)">MAAHAD TAHFIZ SWASTA (AZG)</option>
                    <option value="PENGAJIAN PONDOK SWASTA (AZA)">PENGAJIAN PONDOK SWASTA (AZA)</option>
                    <option value="SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)">SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)</option>
                    <option value="SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)</option>
                    <option value="SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)">SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)</option>
                    <option value="SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)">SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)</option>
                    <option value="SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)">SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)</option>
                    <option value="TADIKA ISLAM PERAK (AAK)">TADIKA ISLAM PERAK (AAK)</option>
                    <option value="TADIKA ISLAM SWASTA (AZS)">TADIKA ISLAM SWASTA (AZS)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => {
                if(!currentUserData.id || !currentUserData.namaInstitusi) return;
                
                // VALIDATION UNTUK SUPERADMIN DAFTAR SEKOLAH BARU
                const normalizedId = currentUserData.id.replace(/\s+/g, '').toUpperCase();
                const kodSekolahPattern = /^[A-Z]{3,4}\d{1,4}$/;
                
                if (normalizedId !== 'SUPERADMIN' && !kodSekolahPattern.test(normalizedId)) {
                   setDialog({ isOpen: true, type: 'alert', title: 'Format Kod Tidak Sah', message: 'Sila masukkan Kod Sekolah yang betul bermula dengan huruf (Contoh: AXM1234).', onConfirm: () => setDialog({isOpen: false})});
                   return; 
                }

                onSaveUser({...currentUserData, id: normalizedId, role: 'institusi'});
                setIsModalOpen(false);
              }} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm transition-colors">Simpan Institusi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabPelaporan = ({ students, users, isLoading }) => {
  const [reportType, setReportType] = useState('daerah');
  
  const daerahsList = ["BAGAN DATUK", "BAGAN SERAI", "BATU GAJAH", "GERIK", "IPOH", "KAMPAR", "KAMPONG GAJAH", "KUALA KANGSAR", "LENGGONG", "MANJUNG", "MUALLIM", "PARIT BUNTAR", "PENGKALAN HULU", "SELAMA", "SERI ISKANDAR", "TAIPING", "TAPAH", "TELUK INTAN"];

  // Menggunakan Nama Penuh Institusi sepertimana di dalam Borang Pendaftaran
  const kategoriSekolahListFull = [
    "SEKOLAH MENENGAH AGAMA RAKYAT (AXM)",
    "MAAHAD TAHFIZ SWASTA (AZG)",
    "PENGAJIAN PONDOK SWASTA (AZA)",
    "SEKOLAH MENENGAH TAHFIZ DARUL RIDZUAN (AAC)",
    "SEKOLAH MENENGAH AGAMA BANTUAN KERAJAAN (SABK)",
    "SEKOLAH RENDAH AGAMA BANTUAN KERAJAAN (SABK)",
    "SEKOLAH RENDAH AGAMA RAKYAT SEPENUH MASA (AYR)",
    "SEKOLAH RENDAH AGAMA RAKYAT INTEGRASI KAFA (AYQ)",
    "TADIKA ISLAM PERAK (AAK)",
    "TADIKA ISLAM SWASTA (AZS)"
  ];

  // 1. DATA: JUMLAH MURID (DAERAH)
  const getDaerahOverallData = () => {
    return daerahsList.map(d => {
      const dUsers = users.filter(u => u.daerah === d).map(u => u.id);
      const count = students.filter(s => dUsers.includes(s.kodInstitusi)).length;
      return { label: d, count };
    });
  };
  const daerahOverallData = getDaerahOverallData();
  const maxDaerahOverall = Math.max(...daerahOverallData.map(d => d.count), 1);

  // 2. DATA: JUMLAH MURID (KATEGORI NAMA PENUH)
  const getKategoriOverallData = () => {
    return kategoriSekolahListFull.map(fullName => {
      const kUsers = users.filter(u => u.kategoriSekolah === fullName).map(u => u.id);
      const count = students.filter(s => kUsers.includes(s.kodInstitusi)).length;
      return { label: fullName, count };
    });
  };
  const kategoriOverallData = getKategoriOverallData();
  const maxKategoriOverall = Math.max(...kategoriOverallData.map(d => d.count), 1);

  // 3. DATA: ASNAF (DAERAH)
  const getAsnafHeatmapData = () => {
    return daerahsList.map(d => {
      const dUsers = users.filter(u => u.daerah === d).map(u => u.id);
      const dStudents = students.filter(s => dUsers.includes(s.kodInstitusi));
      const count = dStudents.filter(s => s.kategoriFakirMiskin === 'Fakir' || s.kategoriFakirMiskin === 'Miskin').length;
      return { label: d, count };
    });
  };
  const asnafHeatmapData = getAsnafHeatmapData();
  const maxAsnaf = Math.max(...asnafHeatmapData.map(d => d.count), 1);

  // 4. DATA: JUMLAH SEKOLAH YANG TELAH MENGISI (KATEGORI NAMA PENUH)
  const getSekolahKategoriData = () => {
    return kategoriSekolahListFull.map(fullName => {
      // Cari kod sekolah berdaftar yang menepati kategori penuh ini
      const kUsers = users.filter(u => u.id !== 'SUPERADMIN' && u.kategoriSekolah === fullName).map(u => u.id);
      // Saring: Kira jumlah sekolah yang ada memasukkan sekurang-kurangnya 1 data murid (Telah Mengisi)
      const count = kUsers.filter(kodSekolah => students.some(s => s.kodInstitusi === kodSekolah)).length;
      return { label: fullName, count };
    });
  };
  const sekolahKategoriData = getSekolahKategoriData();
  const maxSekolahKategori = Math.max(...sekolahKategoriData.map(d => d.count), 1);

  // FUNGSI WARNA UNTUK 4 TEMA
  const getHeatmapColor = (count, max, type = 'red') => {
    if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-200';
    const ratio = count / max;
    
    if (type === 'red') {
      if (ratio > 0.8) return 'bg-red-700 text-white shadow-md border-red-800';
      if (ratio > 0.6) return 'bg-red-600 text-white shadow-md border-red-700';
      if (ratio > 0.4) return 'bg-red-500 text-white shadow-sm border-red-600';
      if (ratio > 0.2) return 'bg-red-400 text-white shadow-sm border-red-500';
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (type === 'emerald') {
      if (ratio > 0.8) return 'bg-emerald-700 text-white shadow-md border-emerald-800';
      if (ratio > 0.6) return 'bg-emerald-600 text-white shadow-md border-emerald-700';
      if (ratio > 0.4) return 'bg-emerald-500 text-white shadow-sm border-emerald-600';
      if (ratio > 0.2) return 'bg-emerald-400 text-white shadow-sm border-emerald-500';
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (type === 'purple') {
      if (ratio > 0.8) return 'bg-purple-700 text-white shadow-md border-purple-800';
      if (ratio > 0.6) return 'bg-purple-600 text-white shadow-md border-purple-700';
      if (ratio > 0.4) return 'bg-purple-500 text-white shadow-sm border-purple-600';
      if (ratio > 0.2) return 'bg-purple-400 text-white shadow-sm border-purple-500';
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else {
      if (ratio > 0.8) return 'bg-indigo-700 text-white shadow-md border-indigo-800';
      if (ratio > 0.6) return 'bg-indigo-600 text-white shadow-md border-indigo-700';
      if (ratio > 0.4) return 'bg-indigo-500 text-white shadow-sm border-indigo-600';
      if (ratio > 0.2) return 'bg-indigo-400 text-white shadow-sm border-indigo-500';
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const getStats = () => {
    let stats = [];
    if (reportType === 'daerah') {
      const daerahs = [...new Set(users.filter(u => u.id !== 'SUPERADMIN').map(u => u.daerah).filter(Boolean))];
      daerahs.forEach(d => {
        const dUsers = users.filter(u => u.daerah === d).map(u => u.id);
        const dStudents = students.filter(s => dUsers.includes(s.kodInstitusi));
        stats.push({ label: d, total: dStudents.length, asnaf: dStudents.filter(s => s.kategoriFakirMiskin === 'Fakir' || s.kategoriFakirMiskin === 'Miskin').length, b40: dStudents.filter(s => s.kategoriB40 && s.kategoriB40 !== 'Bukan B40').length });
      });
    } else {
      const kat = [...new Set(users.filter(u => u.id !== 'SUPERADMIN').map(u => u.kategoriSekolah).filter(Boolean))];
      kat.forEach(k => {
        const kUsers = users.filter(u => u.kategoriSekolah === k).map(u => u.id);
        const kStudents = students.filter(s => kUsers.includes(s.kodInstitusi));
        stats.push({ label: k, total: kStudents.length, asnaf: kStudents.filter(s => s.kategoriFakirMiskin === 'Fakir' || s.kategoriFakirMiskin === 'Miskin').length, b40: kStudents.filter(s => s.kategoriB40 && s.kategoriB40 !== 'Bukan B40').length });
      });
    }
    return stats;
  };

  const handlePrint = () => { window.print(); };

  // KIRAAN MURID JANTINA
  const muridLelaki = students.filter(s => s.jantina === 'Lelaki').length;
  const muridPerempuan = students.filter(s => s.jantina === 'Perempuan').length;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Statistik Keseluruhan</h2>
        <button onClick={handlePrint} className="px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 shadow-sm flex items-center gap-2"><FileDown className="w-4 h-4"/> Cetak A4</button>
      </div>

      {/* 5 KOTAK STATISTIK ATAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm text-center">
           <h3 className="text-[10px] sm:text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Jumlah Murid</h3>
           {isLoading ? <div className="h-8 bg-blue-200/50 rounded w-16 mx-auto animate-pulse"></div> : <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{students.length}</p>}
        </div>
        <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 shadow-sm text-center">
           <h3 className="text-[10px] sm:text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">Jumlah Asnaf</h3>
           {isLoading ? <div className="h-8 bg-cyan-200/50 rounded w-16 mx-auto animate-pulse"></div> : <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600">{students.filter(s => s.kategoriFakirMiskin === 'Fakir' || s.kategoriFakirMiskin === 'Miskin').length}</p>}
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm text-center">
           <h3 className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Jumlah B40</h3>
           {isLoading ? <div className="h-8 bg-amber-200/50 rounded w-16 mx-auto animate-pulse"></div> : <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{students.filter(s => s.kategoriB40 && s.kategoriB40 !== 'Bukan B40').length}</p>}
        </div>
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 shadow-sm text-center">
           <h3 className="text-[10px] sm:text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">Murid Lelaki</h3>
           {isLoading ? <div className="h-8 bg-teal-200/50 rounded w-16 mx-auto animate-pulse"></div> : <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">{muridLelaki}</p>}
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm text-center">
           <h3 className="text-[10px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">Murid Perempuan</h3>
           {isLoading ? <div className="h-8 bg-rose-200/50 rounded w-16 mx-auto animate-pulse"></div> : <p className="text-2xl sm:text-3xl font-extrabold text-rose-600">{muridPerempuan}</p>}
        </div>
      </div>

      {/* PETA HABA 1: JUMLAH KESELURUHAN (DAERAH) */}
      <div className="mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
           <Map className="w-5 h-5 text-indigo-600"/>
           <h3 className="text-lg font-bold text-slate-800">Peta Haba (Heatmap) Taburan Keseluruhan Murid Mengikut Daerah</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
           {daerahOverallData.map(d => (
             <div key={d.label} className={`p-3 rounded-lg border flex flex-col justify-center items-center text-center transition-all duration-300 ${getHeatmapColor(d.count, maxDaerahOverall, 'indigo')}`}>
                <span className="text-[10px] font-bold uppercase mb-1 opacity-90">{d.label}</span>
                <span className="text-xl font-black">{isLoading ? '-' : d.count}</span>
             </div>
           ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
           <span>Rendah</span>
           <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
              <div className="w-4 h-4 rounded bg-indigo-100"></div>
              <div className="w-4 h-4 rounded bg-indigo-400"></div>
              <div className="w-4 h-4 rounded bg-indigo-500"></div>
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <div className="w-4 h-4 rounded bg-indigo-700"></div>
           </div>
           <span>Tinggi</span>
        </div>
      </div>

      {/* PETA HABA 2: JUMLAH KESELURUHAN MURID (KATEGORI NAMA PENUH) */}
      <div className="mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
           <Map className="w-5 h-5 text-emerald-600"/>
           <h3 className="text-lg font-bold text-slate-800">Peta Haba (Heatmap) Taburan Keseluruhan Murid Mengikut Kategori</h3>
        </div>
        {/* Menggunakan grid-cols-1 ke grid-cols-4 kerana nama institusi sangat panjang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {kategoriOverallData.map(d => (
             <div key={d.label} className={`p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-300 ${getHeatmapColor(d.count, maxKategoriOverall, 'emerald')}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase mb-3 opacity-90 leading-snug">{d.label}</span>
                <span className="text-2xl font-black">{isLoading ? '-' : d.count}</span>
             </div>
           ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
           <span>Rendah</span>
           <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
              <div className="w-4 h-4 rounded bg-emerald-100"></div>
              <div className="w-4 h-4 rounded bg-emerald-400"></div>
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <div className="w-4 h-4 rounded bg-emerald-600"></div>
              <div className="w-4 h-4 rounded bg-emerald-700"></div>
           </div>
           <span>Tinggi</span>
        </div>
      </div>

      {/* PETA HABA 3: ASNAF FAKIR/MISKIN (DAERAH) */}
      <div className="mb-10 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
           <Map className="w-5 h-5 text-red-600"/>
           <h3 className="text-lg font-bold text-slate-800">Peta Haba (Heatmap) Taburan Asnaf Mengikut Daerah</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
           {asnafHeatmapData.map(d => (
             <div key={d.label} className={`p-3 rounded-lg border flex flex-col justify-center items-center text-center transition-all duration-300 ${getHeatmapColor(d.count, maxAsnaf, 'red')}`}>
                <span className="text-[10px] font-bold uppercase mb-1 opacity-90">{d.label}</span>
                <span className="text-xl font-black">{isLoading ? '-' : d.count}</span>
             </div>
           ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
           <span>Rendah</span>
           <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
              <div className="w-4 h-4 rounded bg-red-100"></div>
              <div className="w-4 h-4 rounded bg-red-400"></div>
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <div className="w-4 h-4 rounded bg-red-700"></div>
           </div>
           <span>Tinggi</span>
        </div>
      </div>

      {/* PETA HABA 4: JUMLAH SEKOLAH MENGISI DATA (KATEGORI) */}
      <div className="mb-10 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
           <School className="w-5 h-5 text-purple-600"/>
           <h3 className="text-lg font-bold text-slate-800">Peta Haba (Heatmap) Pengisian: Institusi Yang Telah Mengisi Data Mengikut Kategori</h3>
        </div>
        {/* Menggunakan grid-cols-1 ke grid-cols-4 kerana nama institusi sangat panjang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {sekolahKategoriData.map(d => (
             <div key={d.label} className={`p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-300 ${getHeatmapColor(d.count, maxSekolahKategori, 'purple')}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase mb-3 opacity-90 leading-snug">{d.label}</span>
                <span className="text-2xl font-black">{isLoading ? '-' : d.count}</span>
             </div>
           ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
           <span>Rendah</span>
           <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200"></div>
              <div className="w-4 h-4 rounded bg-purple-100"></div>
              <div className="w-4 h-4 rounded bg-purple-400"></div>
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <div className="w-4 h-4 rounded bg-purple-600"></div>
              <div className="w-4 h-4 rounded bg-purple-700"></div>
           </div>
           <span>Tinggi</span>
        </div>
      </div>

      {/* JADUAL STATISTIK */}
      <div className="mb-6 flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700">
          <option value="daerah">Jadual Pecahan Mengikut Daerah</option>
          <option value="kategori">Jadual Pecahan Mengikut Kategori Sekolah</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{reportType === 'daerah' ? 'Daerah' : 'Kategori Sekolah'}</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Murid</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Asnaf (Fakir/Miskin)</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Golongan B40</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
               [...Array(4)].map((_, i) => (
                 <tr key={i} className="animate-pulse bg-slate-50/50">
                   <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                   <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                   <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                   <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                 </tr>
               ))
            ) : (
              getStats().map((st, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{st.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-600">{st.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-cyan-600">{st.asnaf}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-amber-600">{st.b40}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white, .bg-white * { visibility: visible; }
          .bg-white { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
};
