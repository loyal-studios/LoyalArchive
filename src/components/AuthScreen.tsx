import { useState } from 'react';
import { ArrowRight, Check, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { requestOtp, verifyOtp } from '../lib/api';
import type { Session } from '../types';

interface Props { onAuthenticated: (session: Session) => void }

export function AuthScreen({ onAuthenticated }: Props) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [trusted, setTrusted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 'email') {
        await requestOtp(email);
        setStep('otp');
      } else {
        onAuthenticated(await verifyOtp(email, code, trusted));
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Login gagal.'); }
    finally { setLoading(false); }
  }

  return <main className="auth-screen">
    <div className="auth-brand">
      <img src="./brand/logo-horizontal.svg" alt="Loyal Archive" />
      <p>Arsip • Ide • Referensi • Pengetahuan</p>
    </div>
    <form className="auth-card" onSubmit={submit}>
      <div className="eyebrow">ARSIP PRIBADI</div>
      <h1>{step === 'email' ? 'Masuk ke Loyal Archive' : 'Periksa email lo'}</h1>
      <p className="muted">{step === 'email' ? 'Gunakan email yang sudah mendapat akses.' : `Kode 6 digit sudah dikirim ke ${email}.`}</p>
      {step === 'email' ? <label className="field">
        <span>Email</span>
        <div className="input-with-icon"><Mail size={18}/><input autoFocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" /></div>
      </label> : <>
        <label className="field">
          <span>Kode OTP</span>
          <div className="input-with-icon"><KeyRound size={18}/><input autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></div>
        </label>
        <label className="check-row"><input type="checkbox" checked={trusted} onChange={(event) => setTrusted(event.target.checked)} /><span className="fake-check"><Check size={13}/></span><span>Percayai perangkat ini selama 30 hari</span></label>
      </>}
      {error && <p className="form-error">{error}</p>}
      <button className="button primary wide" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18}/> : <>{step === 'email' ? 'Kirim kode' : 'Masuk'}<ArrowRight size={18}/></>}</button>
      {step === 'otp' && <button className="text-button" type="button" onClick={() => setStep('email')}>Ganti email</button>}
    </form>
  </main>;
}
