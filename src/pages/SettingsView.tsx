import React, { useState } from 'react';
import { Settings, Shield, Cpu, ExternalLink, User, Paintbrush, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SettingsView = () => {
  const { user, profile, updatePreferences, uploadAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focusArea, setFocusArea] = useState(profile?.preferences?.focusArea || 'General');
  const [dailyTargetDSA, setDailyTargetDSA] = useState(profile?.preferences?.dailyTargetDSA || 5);
  const [theme, setTheme] = useState(profile?.preferences?.theme || 'light');

  const apiUrl = import.meta.env.VITE_LEMMA_API_URL || '/api';
  const podId = import.meta.env.VITE_LEMMA_POD_ID || 'Not configured';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      await uploadAvatar(e.target.files[0]);
    } catch (err) {
      console.error('[Settings] Failed to upload avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        theme: theme as any,
        focusArea,
        dailyTargetDSA: Number(dailyTargetDSA),
      });
    } catch (err) {
      console.error('[Settings] Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col font-body overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">Manage your KAIRO profile, preferences, and connections.</p>
      </header>

      <div className="space-y-6 max-w-2xl">
        {/* User Profile Card */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading font-semibold text-text-primary">User Profile</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            {/* Avatar Upload */}
            <div className="relative group cursor-pointer w-20 h-20">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20 shadow-sm">
                  {user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <label className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-medium gap-1">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Change</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} className="hidden" />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <p className="font-heading font-bold text-text-primary text-lg">{user?.displayName || 'KAIRO User'}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <p className="text-xs text-gray-400 font-mono">UID: {user?.uid}</p>
            </div>
          </div>
        </div>

        {/* Preferences & Theme */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Paintbrush className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading font-semibold text-text-primary">Preferences & Customization</h2>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'teal' | 'slate')}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="light">Light Theme (Teal-Clean)</option>
                  <option value="dark">Dark Theme</option>
                  <option value="teal">Vibrant Teal</option>
                  <option value="slate">Slate Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Daily Target (DSA Problems)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={dailyTargetDSA}
                  onChange={(e) => setDailyTargetDSA(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Current Focus Area</label>
              <input
                type="text"
                placeholder="e.g. MERN Stack, Placements, DSA, GATE"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {/* Connection Status */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="font-heading font-semibold text-text-primary">KAIRO Pod Connection</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-text-secondary">Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-text-secondary">Pod ID</span>
              <span className="text-sm font-mono bg-gray-100 text-text-primary px-3 py-1 rounded-lg">{podId}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-text-secondary">API Endpoint</span>
              <span className="text-sm font-mono bg-gray-100 text-text-primary px-3 py-1 rounded-lg">{apiUrl}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-text-secondary">Auth Mode</span>
              <span className="text-sm font-medium text-text-primary bg-secondary text-primary px-3 py-1 rounded-lg">Lemma CLI Token (Dev)</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="font-heading font-semibold text-text-primary">Security & Privacy</h2>
          </div>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>• All AI data is stored exclusively in the <strong className="text-text-primary">Lemma Pod</strong>. No data is stored on your device.</p>
            <p>• Firebase is used for Google Authentication, User Profile storage, avatar uploads, and UI settings cache.</p>
            <p>• Your Lemma token is kept in <code className="bg-gray-100 px-1 rounded text-text-primary">.env.local</code> and is never committed to Git.</p>
            <p>• The Vite dev proxy forwards API requests to <code className="bg-gray-100 px-1 rounded text-text-primary">api.lemma.work</code> to prevent CORS issues.</p>
          </div>
        </div>

        {/* Links */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-text-primary mb-4">Resources</h2>
          <div className="space-y-3">
            {[
              { label: 'Lemma Pod Dashboard', href: 'https://app.lemma.work' },
              { label: 'Lemma Documentation', href: 'https://docs.lemma.work' },
              { label: 'KAIRO GitHub Repository', href: 'https://github.com' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors text-sm text-text-primary"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
