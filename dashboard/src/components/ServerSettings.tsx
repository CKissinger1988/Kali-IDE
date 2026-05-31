import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export const ServerSettings: React.FC = () => {
  const [serverIp, setServerIp] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [encryptionMode, setEncryptionMode] = useState<string>('mtls');
  const [useHsmAuth, setUseHsmAuth] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load the saved IP address on component mount
  useEffect(() => {
    const savedIp = localStorage.getItem('spartan_server_ip') || '';
    const savedKey = localStorage.getItem('spartan_api_key') || '';
    const savedEnc = localStorage.getItem('spartan_encryption_mode') || 'mtls';
    const savedHsm = localStorage.getItem('spartan_use_hsm') !== 'false';
    setServerIp(savedIp);
    setApiKey(savedKey);
    setEncryptionMode(savedEnc);
    setUseHsmAuth(savedHsm);
  }, []);

  // Save the IP address to local storage and sync with backend API
  const handleSave = async () => {
    if (encryptionMode === 'mtls' && !serverIp.startsWith('https://')) {
      alert('[!] CRITICAL: Zero-Trust mTLS requires a secure HTTPS endpoint.');
      return;
    }

    localStorage.setItem('spartan_server_ip', serverIp);
    localStorage.setItem('spartan_api_key', apiKey);
    localStorage.setItem('spartan_encryption_mode', encryptionMode);
    localStorage.setItem('spartan_use_hsm', useHsmAuth.toString());
    setIsSaving(true);
    
    try {
      const response = await apiFetch('/api/settings/update-host', {
        method: 'POST',
        body: JSON.stringify({ spartanIp: serverIp, apiKey, encryptionMode, useHsmAuth })
      });
      
      if (response.ok) {
        alert(`Server IP [${serverIp}] saved and synced to backend!`);
      } else {
        alert('Saved locally, but failed to sync with backend.');
      }
    } catch (error) {
      console.error('Failed to sync server IP to backend:', error);
      alert('Saved locally, but a network error occurred syncing to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-panel-section">
      <h3>Spartan AI Hub Connection</h3>
      <p className="text-[12px] text-[#8e8e8e] mb-4">Configure Zero-Trust routing and cryptographic identity parameters for the Spartan Master Hub.</p>
      
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', marginTop: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="serverIp">Server IP Address:</label>
        <input
          type="text"
          id="serverIp"
          value={serverIp}
          onChange={(e) => setServerIp(e.target.value)}
          placeholder="e.g., https://supreme.spartan-hub.local"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="apiKey">Authorization Token (Optional):</label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Fallback API token..."
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="encryptionMode">Encryption Matrix:</label>
          <select 
            id="encryptionMode" 
            value={encryptionMode} 
            onChange={(e) => setEncryptionMode(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#1e1e1e', color: '#fff' }}
          >
            <option value="mtls">Zero-Trust Cryptographic (mTLS)</option>
            <option value="mesh">Mesh Overlay / Darknet (WireGuard)</option>
            <option value="tls">Standard HTTPS (TLS 1.3)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input type="checkbox" id="useHsmAuth" checked={useHsmAuth} onChange={(e) => setUseHsmAuth(e.target.checked)} />
          <label htmlFor="useHsmAuth" className="text-[12px] text-green-500 font-bold">Require HSM Sovereign Signature</label>
        </div>

        <button onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', cursor: 'pointer', marginTop: '8px' }}>
          {isSaving ? 'Saving...' : 'Save Connection'}
        </button>
      </div>
    </div>
  );
};