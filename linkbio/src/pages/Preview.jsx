import { useParams, useNavigate } from 'react-router-dom'
import styles from './Preview.module.css'

const DEMO_PAGES = {
  crescendo: {
    name: '漸強實驗室',
    handle: 'crescendo.lab',
    bio: '亞洲領先 AI 對話雲平台\n讓互動數據驅動品牌成長 🚀',
    emoji: '🐦',
    theme: { bg: 'linear-gradient(160deg,#0A1628 0%,#0D2B55 60%,#0F3460 100%)', accent: '#3B9EFF' },
    socials: ['📸', '💼', '📘', '▶️', '💬'],
    blocks: [
      { type: 'link',    title: '官方網站',       desc: 'cresclab.com',          icon: '🌐', grad: ['#1B6FE8','#3B9EFF'] },
      { type: 'link',    title: 'MAAC 行銷自動化', desc: 'LINE 行銷一站式平台',   icon: '💡', grad: ['#0D2B55','#1B6FE8'] },
      { type: 'link',    title: 'CAAC 對話式 AI',  desc: '智慧客服與銷售自動化', icon: '🤖', grad: ['#3B9EFF','#7EC8FF'] },
      { type: 'divider' },
      { type: 'header',  text: '精選內容' },
      { type: 'cards',   items: [
        { icon: '📊', title: '2025 行銷報告', sub: '立即下載' },
        { icon: '🏆', title: '客戶案例',      sub: '700+ 品牌' },
        { icon: '🎓', title: '免費課程',      sub: 'LINE 行銷' },
        { icon: '💬', title: '預約 Demo',     sub: '聯絡我們' },
      ]},
    ],
  },
  designer: {
    name: '王小明設計',
    handle: 'mingdesign',
    bio: 'UI/UX 設計師 · 品牌識別 · 網頁設計\n讓每個像素都有意義 ✦',
    emoji: '🎨',
    theme: { bg: 'linear-gradient(160deg,#0D0D1A 0%,#1A1040 60%,#2D1B69 100%)', accent: '#A78BFA' },
    socials: ['📸', '🐦', '💼', '🖼️'],
    blocks: [
      { type: 'link', title: '設計作品集',   desc: 'behance.net/ming',   icon: '🖼️', grad: ['#7C3AED','#A78BFA'] },
      { type: 'link', title: 'Dribbble',      desc: '最新設計上傳中',    icon: '🏀', grad: ['#6D28D9','#7C3AED'] },
      { type: 'link', title: '接案洽談',     desc: '填寫需求表單',       icon: '📋', grad: ['#A78BFA','#C4B5FD'] },
      { type: 'divider' },
      { type: 'header', text: '近期作品' },
      { type: 'cards', items: [
        { icon: '📱', title: 'App 設計',   sub: '2025 Q1' },
        { icon: '🌐', title: '網站改版',   sub: 'B2B 品牌' },
        { icon: '✦',  title: '品牌識別',   sub: '新創公司' },
        { icon: '🎬', title: '動態設計',   sub: 'Motion' },
      ]},
    ],
  },
  podcast: {
    name: '行銷煉金術',
    handle: 'marketing.alchemy',
    bio: '每週深談數位行銷趨勢、增長駭客\n與品牌策略 🎙️',
    emoji: '🎙️',
    theme: { bg: 'linear-gradient(160deg,#071A0E 0%,#0D3320 60%,#1A5C3A 100%)', accent: '#34D399' },
    socials: ['🎵', '🎧', '📘', '📸'],
    blocks: [
      { type: 'link', title: 'Spotify 收聽',    desc: '最新集數上線',    icon: '🎵', grad: ['#059669','#34D399'] },
      { type: 'link', title: 'Apple Podcasts',  desc: '訂閱不錯過',      icon: '🎧', grad: ['#047857','#059669'] },
      { type: 'link', title: '行銷資源包',       desc: '免費下載',        icon: '📦', grad: ['#34D399','#6EE7B7'] },
      { type: 'divider' },
      { type: 'header', text: '熱門集數' },
      { type: 'cards', items: [
        { icon: '🔥', title: 'AI 行銷革命', sub: 'EP.42' },
        { icon: '📊', title: 'SEO 大解密',  sub: 'EP.38' },
        { icon: '💰', title: '廣告投放術',  sub: 'EP.35' },
        { icon: '🚀', title: '成長駭客',    sub: 'EP.30' },
      ]},
    ],
  },
}

export default function Preview() {
  const { handle } = useParams()
  const nav = useNavigate()
  const page = DEMO_PAGES[handle] || DEMO_PAGES.crescendo
  const { theme } = page

  return (
    <div className={styles.page} style={{ background: theme.bg }}>
      <div className={styles.orb1} style={{ background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)` }} />
      <div className={styles.orb2} style={{ background: `radial-gradient(circle, ${theme.accent}12 0%, transparent 70%)` }} />

      {/* top nav */}
      <div className={styles.topnav}>
        <button className={styles.backBtn} onClick={() => nav('/')}>← 首頁</button>
        <button className={styles.editBtn} onClick={() => nav('/editor')}
          style={{ borderColor: `${theme.accent}55`, color: theme.accent }}>
          建立你的頁面
        </button>
      </div>

      <div className={styles.container}>
        {/* profile */}
        <div className={styles.profile}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}
              style={{ boxShadow: `0 0 0 3px ${theme.accent}55, 0 8px 32px ${theme.accent}44` }}>
              {page.emoji}
            </div>
          </div>
          <div className={styles.name}>{page.name}</div>
          <div className={styles.handle} style={{ color: theme.accent }}>@{page.handle}</div>
          <div className={styles.bio}>{page.bio}</div>
          <div className={styles.socials}>
            {page.socials.map((s, i) => (
              <button key={i} className={styles.socialBtn}
                style={{ borderColor: `${theme.accent}44` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = `${theme.accent}22` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${theme.accent}44`; e.currentTarget.style.background = '' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* divider */}
        <div className={styles.divider}
          style={{ background: `linear-gradient(90deg,transparent,${theme.accent}44,transparent)` }} />

        {/* blocks */}
        <div className={styles.blocks}>
          {page.blocks.map((b, i) => {
            if (b.type === 'link') return (
              <a key={i} href={b.url || '#'} className={styles.linkBtn}
                style={{ borderColor: `${theme.accent}33` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.accent}99`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.accent}33` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${theme.accent}33`; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                <div className={styles.linkIcon}
                  style={{ background: `linear-gradient(135deg,${b.grad[0]},${b.grad[1]})` }}>
                  {b.icon}
                </div>
                <div className={styles.linkText}>
                  <div className={styles.linkTitle}>{b.title}</div>
                  {b.desc && <div className={styles.linkDesc}>{b.desc}</div>}
                </div>
                <span className={styles.linkArrow} style={{ color: theme.accent }}>›</span>
              </a>
            )
            if (b.type === 'divider') return (
              <div key={i} className={styles.divider}
                style={{ background: `linear-gradient(90deg,transparent,${theme.accent}44,transparent)` }} />
            )
            if (b.type === 'header') return (
              <div key={i} className={styles.sectionLabel}
                style={{ color: theme.accent }}>
                {b.text}
              </div>
            )
            if (b.type === 'cards') return (
              <div key={i} className={styles.cardsGrid}>
                {b.items.map((c, j) => (
                  <a key={j} href="#" className={styles.card}
                    style={{ borderColor: `${theme.accent}33` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.accent}77`; e.currentTarget.style.background = `${theme.accent}18`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${theme.accent}33`; e.currentTarget.style.background = ''; e.currentTarget.style.transform = '' }}>
                    <span className={styles.cardIcon}>{c.icon}</span>
                    <div className={styles.cardTitle}>{c.title}</div>
                    <div className={styles.cardSub}>{c.sub}</div>
                  </a>
                ))}
              </div>
            )
            return null
          })}
        </div>

        {/* footer branding */}
        <div className={styles.footer}>
          <div className={styles.footerBrand}>🐦 <span style={{ background: `linear-gradient(90deg,${theme.accent},#7EC8FF)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>LinkBio</span></div>
          <button className={styles.footerCta} onClick={() => nav('/editor')}
            style={{ background: `linear-gradient(90deg,${theme.accent === '#3B9EFF' ? '#1B6FE8' : theme.accent},${theme.accent})` }}>
            建立我的頁面 →
          </button>
        </div>
      </div>
    </div>
  )
}
