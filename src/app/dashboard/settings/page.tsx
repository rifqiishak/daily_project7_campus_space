'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [nim, setNim] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (user) {
        setEmail(user.email || '');

        // Tarik data profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, nim_nip') 
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setFullName(profile.full_name || ''); 
          setRole(profile.role || 'KOSONG DI DATABASE'); 
          setNim(profile.nim_nip || 'KOSONG DI DATABASE'); 
        } else {
          setRole('TIDAK ADA AKSES BACA / ID SALAH');
          setNim('TIDAK ADA AKSES BACA / ID SALAH');
        }
      }
    } catch (error) {
      console.error('Gagal memuat profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi tidak valid");

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (newPassword.trim() !== '') {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (passwordError) throw passwordError;
        setNewPassword(''); 
      }

      toast.success('Profil berhasil diperbarui! 🎉');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Akun</h1>
        <p className="text-slate-500 mt-2 font-medium">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        <form onSubmit={handleUpdateProfile} className="p-8 md:p-10 space-y-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800">Identitas Pengguna</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-700 bg-slate-50/30"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">NIM / NIP</label>
                <div className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border border-slate-200 text-slate-500 font-bold cursor-not-allowed">
                  {nim}
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Peran (Role)</label>
                <div className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border border-slate-200 text-slate-500 font-black uppercase tracking-wider text-xs cursor-not-allowed">
                  {role}
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Alamat Email</label>
                <div className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border border-slate-200 text-slate-500 font-bold cursor-not-allowed text-sm">
                  {email}
                </div>
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shadow-rose-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800">Keamanan Akun</h3>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ganti Password Baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-600 outline-none transition-all font-bold text-slate-700 bg-slate-50/30"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className={`px-10 py-4 rounded-2xl font-black text-white transition-all shadow-xl active:scale-95 ${
                saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'
              }`}
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
