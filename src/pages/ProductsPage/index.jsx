import { useState, useEffect } from 'react'
import { api } from "../../config/api";

const EMPTY = { name: '', price: '', quantity: '', status: 'Ativo', img: '' }

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
    const [err, setErr] = useState('')
    const [ok, setOk] = useState('')
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null) // product being edited
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [preview, setPreview] = useState('')

    function set(field) {
        return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
    }

    async function loadProducts() {
        setLoading(true); setErr('')
        try {
            const data = await api.getProducts()
            setProducts(data.produtos || [])
        } catch (e) {
            setErr(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadProducts() }, [])

    function openNew() {
        setEditing(null)
        setForm(EMPTY)
        setOk(''); setErr('')
        setShowForm(true)
    }

    function openEdit(p) {
        setEditing(p)
        setForm({ name: p.name, price: String(p.price), quantity: String(p.quantity), status: p.status, img: p.img || '' })
        setOk(''); setErr('')
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditing(null)
        setForm(EMPTY)
        setImageFile(null)
        setPreview('')
        setOk('')
        setErr('')
    }

    async function onSubmit(e) {
        e.preventDefault()
        setFormLoading(true)
        setOk('')
        setErr('')

        try {

            let imageUrl = form.img

            if (imageFile) {
                imageUrl = await uploadImage(imageFile)
            }

            const payload = {
                name: form.name.trim(),
                price: Number(form.price),
                quantity: Number(form.quantity),
                status: form.status,
                img: imageUrl || null,
            }

            if (
                !payload.name ||
                isNaN(payload.price) ||
                isNaN(payload.quantity)
            ) {
                throw new Error(
                    'Preencha nome, preço e quantidade corretamente.'
                )
            }

            if (editing) {

                await api.updateProduct(editing.id, payload)

                setOk('Produto atualizado com sucesso.')

            } else {

                await api.createProduct(payload)

                setOk('Produto cadastrado com sucesso.')
            }

            await loadProducts()

            setTimeout(closeForm, 1200)

        } catch (e2) {

            setErr(e2.message)

        } finally {

            setFormLoading(false)
        }
    }

    async function inactivate(p) {
        if (!confirm(`Inativar "${p.name}"?`)) return
        setLoading(true); setOk(''); setErr('')
        try {
            await api.inactivateProduct(p.id)
            setOk(`"${p.name}" inativado.`)
            await loadProducts()
        } catch (e2) {
            setErr(e2.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )
    async function uploadImage(file) {

        const formData = new FormData()

        formData.append('image', file)

        const data = await api.uploadProductImage(formData)

        return data.url
    }


    async function activate(p) {

        setLoading(true)
        setOk('')
        setErr('')

        try {

            await api.activateProduct(p.id)

            setOk(`"${p.name}" reativado.`)

            await loadProducts()

        } catch (e2) {

            setErr(e2.message)

        } finally {

            setLoading(false)
        }
    }
    return (
        <div className="page-content">
            {/* Topbar */}
            <div className="topbar" style={{ marginLeft: '-36px', marginRight: '-36px', paddingLeft: '36px', width: 'calc(100% + 72px)' }}>
                <div>
                    <div className="topbar-title">Produtos</div>
                    <div className="topbar-sub">Gerencie seu catálogo e estoque</div>
                </div>
                <div className="topbar-spacer" />
                <button className="btn btn-primary btn-sm" onClick={openNew}>
                    + Novo produto
                </button>
            </div>

            <div style={{ height: 32 }} />

            {err && !showForm && <div className="alert alert-error mb-4">{err}</div>}
            {ok && !showForm && <div className="alert alert-success mb-4">{ok}</div>}

            <div style={{ marginBottom: 20 }}>
                <input
                    className="input"
                    placeholder="Pesquisar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Modal form */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200, padding: 20, backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
                                {editing ? 'Editar produto' : 'Novo produto'}
                            </h2>
                            <button className="btn btn-secondary btn-sm" onClick={closeForm}>✕</button>
                        </div>

                        <form className="form-grid" onSubmit={onSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nome do produto</label>
                                <input className="input" value={form.name} onChange={set('name')} placeholder="Arroz, Feijão, Leite..." required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Preço (R$)</label>
                                    <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} placeholder="12.90" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Quantidade</label>
                                    <input className="input" type="number" min="0" value={form.quantity} onChange={set('quantity')} placeholder="10" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="input" value={form.status} onChange={set('status')}>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </div>

                            <div className="form-group">

                                <label className="form-label">
                                    Imagem do produto
                                </label>

                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {

                                        const file = e.target.files[0]

                                        if (!file) return

                                        setImageFile(file)

                                        setPreview(URL.createObjectURL(file))
                                    }}
                                />

                                {(preview || form.img) && (
                                    <div style={{ marginTop: 12 }}>

                                        <img
                                            src={preview || form.img}
                                            alt="Preview"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 12,
                                                border: '1px solid var(--border)'
                                            }}
                                        />

                                    </div>
                                )}
                            </div>

                            {err && <div className="alert alert-error">{err}</div>}
                            {ok && <div className="alert alert-success">{ok}</div>}

                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="btn btn-secondary" type="button" onClick={closeForm} style={{ flex: 1 }}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" type="submit" disabled={formLoading} style={{ flex: 1 }}>
                                    {formLoading
                                        ? <><span className="spinner" /> Salvando...</>
                                        : editing ? 'Atualizar' : 'Cadastrar'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products table */}
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Imagem</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                <span className="spinner" style={{ width: 20, height: 20 }} />
                            </td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                Nenhum produto cadastrado. Crie o primeiro!
                            </td></tr>
                        ) : filteredProducts.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 500 }}>{p.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)' }}>R$ {Number(p.price).toFixed(2)}</td>
                                <td>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        color: p.quantity <= 5 ? 'var(--red)' : p.quantity <= 20 ? 'var(--amber)' : 'var(--accent)',
                                        fontWeight: 600,
                                    }}>
                                        {p.quantity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${p.status === 'Ativo' ? 'badge-active' : 'badge-inactive'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td>
                                    {p.img
                                        ? <img src={p.img} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                                        : <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                                    }
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button>
                                        {p.status === 'Ativo' ? (

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => inactivate(p)}
                                            >
                                                Inativar
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => activate(p)}
                                            >
                                                Reativar
                                            </button>

                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}