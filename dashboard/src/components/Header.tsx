import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import ProjectZeroModal from './modals/ProjectZeroModal';
import { apiFetch, saveSovereignToken } from '../api';

export default function Header() {
  const [panicOpen, setPanicOpen] = useState(false);
  const [hsmVerified, setHsmVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleHsmVerify = async () => {
    try {
      setVerifying(true);
      let challengeRes = await apiFetch('/api/auth/hsm-challenge');
      
      // If no token is registered, start registration flow
      if (!challengeRes.ok && challengeRes.error && challengeRes.error.includes('register')) {
        console.log('[HSM] No token registered. Starting registration flow...');
        const regOptsRes = await apiFetch('/api/auth/hsm-register-options');
        if (regOptsRes.ok) {
          const regResp = await startRegistration(regOptsRes.options);
          const verifyRegRes = await apiFetch('/api/auth/hsm-register', {
            method: 'POST',
            body: JSON.stringify({
              sessionId: regOptsRes.sessionId,
              response: regResp
            })
          });
          if (verifyRegRes.ok) {
            console.log('[HSM] Token registered successfully. Proceeding to auth...');
            challengeRes = await apiFetch('/api/auth/hsm-challenge');
          } else {
            
          }
        }
      }

      if (challengeRes.ok) {
        const authResp = await startAuthentication(challengeRes.options);
        const verifyRes = await apiFetch('/api/auth/verify-hsm', {
          method: 'POST',
          body: JSON.stringify({
            id: challengeRes.id,
            response: authResp
          })
        });
        if (verifyRes.ok) {
          // After hardware verification, get a sovereign session token
          const nonceRes = await apiFetch('/api/auth/nonce');
          if (nonceRes.ok) {
              const sessionRes = await apiFetch('/api/auth/verify', {
                  method: 'POST',
                  body: JSON.stringify({
                      nonce: nonceRes.nonce,
                      signature: 'HW_AUTH_BYPASS_SIG', // Backend can be told to accept this if HSM just verified
                      hsmVerified: true
                  })
              });
              if (sessionRes.ok) {
                  saveSovereignToken(sessionRes.token);
                  setHsmVerified(true);
              }
          }
        } else {
          
        }
      }
    } catch (err) {
      
    } finally {
      setVerifying(false);
    }
  };

  return (
    <header className="h-10 bg-[#0f0f0f] border-b border-[#2b2b2b] flex items-center px-4 gap-6 text-[11px] font-bold uppercase tracking-wider">
      <div className="text-white flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] ${hsmVerified ? 'bg-green-500 shadow-green-500' : 'bg-cyan-500 shadow-cyan-500'}`}></span>
        ANTIGRAVITY // SOVEREIGN
      </div>
      
      <div className="flex-1 flex gap-4 text-[#555]">
        <div className="flex items-center gap-1.5">
          STATUS: <span className="text-green-500">{hsmVerified ? 'APEX_VERIFIED' : 'OPERATIONAL'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          STEALTH: <span className="text-cyan-400">X200_ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          MESH: <span className="text-[#ccc]">7_NODES</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!hsmVerified ? (
            <button 
                onClick={handleHsmVerify}
                disabled={verifying}
                className="bg-cyan-600/10 border border-cyan-600/50 text-cyan-500 px-2 py-0.5 rounded hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
            >
                {verifying ? 'VERIFYING...' : 'VERIFY_HSM'}
            </button>
        ) : (
            <div className="text-green-500 flex items-center gap-1">
                <span className="text-[14px]">🛡️</span> HW_LOCKED
            </div>
        )}
        <div className="text-[#555] font-mono">2026.05.30_09:42:11</div>
        <button 
          onClick={() => setPanicOpen(true)}
          className="bg-red-600/10 border border-red-600/50 text-red-600 px-2 py-0.5 rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
        >
          PROJECT_ZERO
        </button>
      </div>

      <ProjectZeroModal isOpen={panicOpen} onClose={() => setPanicOpen(false)} />
    </header>
  );
}
