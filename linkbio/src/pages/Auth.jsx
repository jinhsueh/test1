import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Auth.module.css'

export default function Auth() {
  const nav = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode]     = useState('login')   // 'login' | 'register'
  const [form, setForm]     = useState({ email: '', handle: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.handle.match(/^[a-z0-9_-]{3,30}$/)) {
          throw new Error('Handle 只能用小寫英數字、_ 和 -，長度 3~30')
        }
        await register(form.email, form.handle, form.password)
      }
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} /><div className={styles.orb2} />
      <div className={styles.card}>
        <div className={styles.logo} onClick={() => nav('/')}>🐦 LinkBio</div>
        <h1 className={styles.title}>
          {mode === 'login' ? '登入帳號' : '建立帳號'}
        </h1>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')}
                   placeholder="you@example.com" required />
          </div>
          {mode === 'register' && (
            <div className={styles.field}>
              <label>Handle（你的頁面網址）</label>
              <div className={styles.handleWrap}>
                <span className={styles.handlePrefix}>linkbio/</span>
                <input value={form.handle} onChange={set('handle')}
                       placeholder="yourname" required />
              </div>
            </div>
          )}
          <div className={styles.field}>
            <label>密碼</label>
            <input type="password" value={form.password} onChange={set('password')}
                   placeholder="至少 8 個字元" minLength={8} required />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? '請稍候…' : mode === 'login' ? '登入' : '建立帳號'}
          </button>
        </form>

        <p className={styles.switchMode}>
          {mode === 'login' ? '還沒有帳號？' : '已有帳號？'}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? '免費註冊' : '登入'}
          </button>
        </p>
      </div>
    </div>
  )
}
