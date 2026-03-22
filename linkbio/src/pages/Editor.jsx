import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Editor.module.css'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const BLOCK_TYPES = [
  { type: 'link',    label: '連結按鈕', icon: '🔗' },
  { type: 'header',  label: '標題文字', icon: '📝' },
  { type: 'divider', label: '分隔線',   icon: '➖' },
  { type: 'socials', label: '社群連結', icon: '📱' },
  { type: 'image',   label: '圖片區塊', icon: '🖼️' },
]

const SOCIAL_OPTIONS = ['Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'LINE', 'Twitter/X', 'TikTok']

const THEMES = [
  { id: 'ocean',   label: '深海藍', bg: 'linear-gradient(160deg,#0A1628 0%,#0D2B55 60%,#0F3460 100%)', accent: '#3B9EFF' },
  { id: 'midnight',label: '暗夜紫', bg: 'linear-gradient(160deg,#0D0D1A 0%,#1A1040 60%,#2D1B69 100%)', accent: '#A78BFA' },
  { id: 'forest',  label: '森林綠', bg: 'linear-gradient(160deg,#071A0E 0%,#0D3320 60%,#1A5C3A 100%)', accent: '#34D399' },
  { id: 'sunset',  label: '夕陽橘', bg: 'linear-gradient(160deg,#1A0A00 0%,#3D1A00 60%,#6B2D00 100%)', accent: '#FB923C' },
]

let uid = 100
const newId = () => ++uid

function makeBlock(type) {
  const id = newId()
  if (type === 'link')    return { id, type, title: '我的連結', url: 'https://', desc: '' }
  if (type === 'header')  return { id, type, text: '區塊標題', size: 'md' }
  if (type === 'divider') return { id, type }
  if (type === 'socials') return { id, type, platforms: ['Instagram', 'LinkedIn'] }
  if (type === 'image')   return { id, type, src: '', alt: '', link: '' }
  return { id, type }
}

export default function Editor() {
  const nav = useNavigate()
  const { id: pageId } = useParams()
  const { user } = useAuth()
  const [pageDbId, setPageDbId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [profile, setProfile] = useState({
    name: '你的名字',
    handle: 'mypage',
    bio: '簡短介紹自己 ✨',
    emoji: '🐦',
  })
  const [blocks, setBlocks] = useState([
    makeBlock('link'),
    makeBlock('link'),
    makeBlock('socials'),
  ])
  const [selected, setSelected] = useState(null)
  const [theme, setTheme] = useState(THEMES[0])
  const [dragging, setDragging] = useState(null)

  // load page from API if id given
  useEffect(() => {
    if (!pageId) return
    api.getPage(pageId).then(page => {
      setPageDbId(page.id)
      setProfile({ name: page.name, handle: page.handle, bio: page.bio, emoji: page.emoji })
      setTheme(THEMES.find(t => t.id === page.theme) || THEMES[0])
      setBlocks(page.blocks.map(b => ({ id: newId(), type: b.type, ...b.data })))
    }).catch(() => nav('/dashboard'))
  }, [pageId])

  /* ── block helpers ── */
  const addBlock = (type) => {
    const b = makeBlock(type)
    setBlocks(prev => [...prev, b])
    setSelected(b.id)
  }

  const updateBlock = (id, patch) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))

  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (selected === id) setSelected(null)
  }

  const moveBlock = (id, dir) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      const next = [...prev]
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  /* ── drag reorder ── */
  const onDragStart = (e, id) => {
    setDragging(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e, id) => {
    e.preventDefault()
    if (dragging === null || dragging === id) return
    setBlocks(prev => {
      const from = prev.findIndex(b => b.id === dragging)
      const to   = prev.findIndex(b => b.id === id)
      const next = [...prev]
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }
  const onDragEnd = () => setDragging(null)

  const selectedBlock = blocks.find(b => b.id === selected)

  return (
    <div className={styles.editor} style={{ '--accent': theme.accent }}>
      {/* ── Top bar ── */}
      <div className={styles.topbar}>
        <button className={styles.back} onClick={() => nav('/')}>← 返回首頁</button>
        <div className={styles.topbarCenter}>
          <span className={styles.topbarLogo}>🐦 LinkBio 編輯器</span>
        </div>
        <div className={styles.topbarActions}>
          <button className={styles.btnPreview} onClick={() => nav(`/p/${profile.handle}`)}>
            預覽頁面 ↗
          </button>
          <button className={styles.btnSave} disabled={saving} onClick={async () => {
            if (!user) { nav('/auth'); return }
            setSaving(true)
            try {
              const payload = {
                name: profile.name, handle: profile.handle,
                bio: profile.bio, emoji: profile.emoji,
                theme: theme.id,
                blocks: blocks.map((b, i) => {
                  const { id: _id, type, ...rest } = b
                  return { type, order: i, data: rest }
                }),
              }
              if (pageDbId) {
                await api.updatePage(pageDbId, payload)
              } else {
                const page = await api.createPage(payload)
                setPageDbId(page.id)
              }
              setSaveMsg('已儲存 ✓')
              setTimeout(() => setSaveMsg(''), 2000)
            } catch (e) {
              setSaveMsg('儲存失敗：' + e.message)
            } finally {
              setSaving(false)
            }
          }}>
            {saving ? '儲存中…' : saveMsg || '儲存發佈'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Left: Block palette + Profile ── */}
        <div className={styles.sidebar}>
          {/* Profile settings */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>個人資訊</div>
            <div className={styles.field}>
              <label>Emoji 頭像</label>
              <input
                value={profile.emoji}
                onChange={e => setProfile(p => ({ ...p, emoji: e.target.value }))}
                maxLength={2}
              />
            </div>
            <div className={styles.field}>
              <label>顯示名稱</label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>帳號 handle</label>
              <input
                value={profile.handle}
                onChange={e => setProfile(p => ({ ...p, handle: e.target.value.replace(/\s/g, '') }))}
              />
            </div>
            <div className={styles.field}>
              <label>簡介</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Theme picker */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>主題風格</div>
            <div className={styles.themeRow}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.themeBtn} ${theme.id === t.id ? styles.themeActive : ''}`}
                  style={{ background: t.bg }}
                  onClick={() => setTheme(t)}
                  title={t.label}
                >
                  {theme.id === t.id && <span className={styles.themeTick}>✓</span>}
                </button>
              ))}
            </div>
            <div className={styles.themeLabels}>
              {THEMES.map(t => (
                <span key={t.id} style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textAlign: 'center' }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Add block */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>新增區塊</div>
            <div className={styles.blockTypes}>
              {BLOCK_TYPES.map(bt => (
                <button key={bt.type} className={styles.blockTypeBtn} onClick={() => addBlock(bt.type)}>
                  <span>{bt.icon}</span>
                  <span>{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Block inspector */}
          {selectedBlock && (
            <div className={styles.panel}>
              <div className={styles.panelTitle}>編輯區塊</div>
              <BlockInspector block={selectedBlock} update={updateBlock} />
            </div>
          )}
        </div>

        {/* ── Center: Canvas ── */}
        <div className={styles.canvas}>
          <div className={styles.phoneFrame} style={{ background: theme.bg }}>
            <div className={styles.frameNotch} />

            {/* profile */}
            <div className={styles.previewProfile}>
              <div className={styles.previewAvatar} style={{ boxShadow: `0 0 0 3px ${theme.accent}66` }}>
                {profile.emoji}
              </div>
              <div className={styles.previewName}>{profile.name || '你的名字'}</div>
              <div className={styles.previewHandle} style={{ color: theme.accent }}>@{profile.handle}</div>
              <div className={styles.previewBio}>{profile.bio}</div>
            </div>

            {/* blocks */}
            <div className={styles.blockList}>
              {blocks.map((b, i) => (
                <div
                  key={b.id}
                  className={`${styles.blockItem} ${selected === b.id ? styles.blockSelected : ''}`}
                  draggable
                  onDragStart={e => onDragStart(e, b.id)}
                  onDragOver={e => onDragOver(e, b.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => setSelected(b.id)}
                  style={selected === b.id ? { borderColor: theme.accent } : {}}
                >
                  <BlockPreview block={b} accent={theme.accent} />
                  <div className={styles.blockControls}>
                    <button onClick={e => { e.stopPropagation(); moveBlock(b.id, 'up') }} disabled={i === 0}>↑</button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(b.id, 'down') }} disabled={i === blocks.length - 1}>↓</button>
                    <button onClick={e => { e.stopPropagation(); deleteBlock(b.id) }} className={styles.deleteBtn}>✕</button>
                  </div>
                </div>
              ))}
              {blocks.length === 0 && (
                <div className={styles.emptyHint}>← 從左側新增區塊</div>
              )}
            </div>

            {/* footer */}
            <div className={styles.frameFooter}>linkbio.cresclab.to/{profile.handle}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Block Preview (inside phone) ── */
function BlockPreview({ block, accent }) {
  if (block.type === 'link') return (
    <div className={styles.previewLink} style={{ borderColor: `${accent}44` }}>
      <span className={styles.previewLinkIcon} style={{ background: `${accent}33`, color: accent }}>🔗</span>
      <span className={styles.previewLinkTitle}>{block.title || '連結標題'}</span>
      <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>›</span>
    </div>
  )
  if (block.type === 'header') return (
    <div className={styles.previewHeader} style={{ fontSize: block.size === 'lg' ? '1rem' : '0.85rem' }}>
      {block.text || '標題'}
    </div>
  )
  if (block.type === 'divider') return (
    <div className={styles.previewDivider} style={{ background: `linear-gradient(90deg,transparent,${accent}55,transparent)` }} />
  )
  if (block.type === 'socials') return (
    <div className={styles.previewSocials}>
      {(block.platforms || []).slice(0, 5).map(p => (
        <div key={p} className={styles.previewSocialIcon} style={{ borderColor: `${accent}44`, color: accent }}>
          {p[0]}
        </div>
      ))}
    </div>
  )
  if (block.type === 'image') return (
    <div className={styles.previewImagePlaceholder}>
      {block.src ? <img src={block.src} alt={block.alt} style={{ width: '100%', borderRadius: 8 }} /> : '🖼️ 圖片區塊'}
    </div>
  )
  return null
}

/* ── Block Inspector (properties panel) ── */
function BlockInspector({ block, update }) {
  if (block.type === 'link') return (
    <>
      <div className={styles.field}>
        <label>標題</label>
        <input value={block.title} onChange={e => update(block.id, { title: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label>網址</label>
        <input value={block.url} onChange={e => update(block.id, { url: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label>副標題（選填）</label>
        <input value={block.desc} onChange={e => update(block.id, { desc: e.target.value })} />
      </div>
    </>
  )
  if (block.type === 'header') return (
    <>
      <div className={styles.field}>
        <label>標題文字</label>
        <input value={block.text} onChange={e => update(block.id, { text: e.target.value })} />
      </div>
      <div className={styles.field}>
        <label>大小</label>
        <select value={block.size} onChange={e => update(block.id, { size: e.target.value })}>
          <option value="sm">小</option>
          <option value="md">中</option>
          <option value="lg">大</option>
        </select>
      </div>
    </>
  )
  if (block.type === 'socials') return (
    <div className={styles.field}>
      <label>選擇平台</label>
      <div className={styles.checkList}>
        {SOCIAL_OPTIONS.map(p => (
          <label key={p} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={(block.platforms || []).includes(p)}
              onChange={e => {
                const cur = block.platforms || []
                update(block.id, {
                  platforms: e.target.checked ? [...cur, p] : cur.filter(x => x !== p)
                })
              }}
            />
            {p}
          </label>
        ))}
      </div>
    </div>
  )
  if (block.type === 'image') return (
    <>
      <div className={styles.field}>
        <label>圖片網址</label>
        <input value={block.src} onChange={e => update(block.id, { src: e.target.value })} placeholder="https://..." />
      </div>
      <div className={styles.field}>
        <label>點擊連結</label>
        <input value={block.link} onChange={e => update(block.id, { link: e.target.value })} placeholder="https://..." />
      </div>
    </>
  )
  return <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>此區塊無可設定的屬性</p>
}
