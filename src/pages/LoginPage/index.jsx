import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from "../../config/api";
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const data = await api.login({ email, senha })
      login(data)
      navigate('/dashboard')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Tech<span>Stock</span></div>
        <div className="auth-step">Passo 3 de 3</div>
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-sub">
          Acesso seguro com <span className="text-accent">criptografia ativa</span>.
        </p>

        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mercado@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>

          {err && <div className="alert alert-error">{err}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div className="auth-switch">
          Sem conta? <Link to="/register">Cadastrar</Link>
          {' · '}
          <Link to="/activate">Ativar conta</Link>
        </div>
      </div>
    </div>
  )
}