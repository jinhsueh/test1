import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const [pages, setPages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats]   = useState({})   // page_id -> { total }

  useEffect(() => {
    if (!user) { nav('/auth'); return }
    api.listPages()
      .then(async (ps) => {
        setPages(ps)
        // fetch click totals for each page
        const entries = await Promise.all(
          ps.map(p => api.getAnalytics(p.id).then(a => [p.id, a.total]).catch(() => [p.id, 0]))
        )
        setStats(Object.fromEntries(entries))
      })
      .catch(() => nav('/auth'))
      .finally(() => setLoading(false))
  }, [user])

  const createNew = async () => {
    const page = await api.createPage({ name: '新頁面', handle: `${user.handle}-${Date.now()}` })
    nav(`/editor/${page.id}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} /><div className={styles.orb2} />

      <nav className={styles.nav}>
        <div className={styles.navLogo} onClick={() => nav('/')}>🐦 LinkBio</div>
        <div className={styles.navRight}>
          <span className={styles.navUser}>@{user?.handle}</span>
          <button className={styles.logoutBtn} onClick={() => { logout(); nav('/') }}>登出</button>
        </div>
      </nav>

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>我的頁面</h1>
            <p className={styles.sub}>管理並發布你的 link-in-bio 頁面</p>
          </div>
          <button className={styles.btnNew} onClick={createNew}>＋ 新增頁面</button>
        </div>

        {loading ? (
          <div className={styles.loadingMsg}>載入中…</div>
        ) : pages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🐦</div>
            <p>還沒有頁面，建立第一個吧！</p>
            <button className={styles.btnNew} onClick={createNew}>建立頁面</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {pages.map(p => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardAvatar}>{p.emoji}</div>
                  <div>
                    <div className={styles.cardName}>{p.name}</div>
                    <div className={styles.cardHandle}>linkbio/{p.handle}</div>
                  </div>
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{stats[p.id] ?? 0}</span>
                    <span className={styles.statLabel}>總點擊數</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{p.blocks.length}</span>
                    <span className={styles.statLabel}>區塊數</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.btnEdit} onClick={() => nav(`/editor/${p.id}`)}>
                    ✏️ 編輯
                  </button>
                  <button className={styles.btnPreview} onClick={() => nav(`/p/${p.handle}`)}>
                    ↗ 預覽
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
