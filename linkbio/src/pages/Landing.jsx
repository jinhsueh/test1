import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const FEATURES = [
  { icon: '🔗', title: '30+ 連結區塊', desc: '按鈕、圖片輪播、影片、表單，自由組合' },
  { icon: '🤖', title: 'AI 一鍵生成', desc: '輸入網址，AI 自動分析並建立頁面' },
  { icon: '📊', title: '深度數據分析', desc: '點擊率、流量來源、受眾行為一目瞭然' },
  { icon: '🎨', title: '完全客製化', desc: '背景、字型、顏色，打造專屬品牌風格' },
  { icon: '📱', title: '行動優先設計', desc: '所有頁面皆針對手機瀏覽完美最佳化' },
  { icon: '⚡', title: '即時同步更新', desc: '修改立即生效，不需等待重新部署' },
]

const PLANS = [
  {
    name: '免費方案',
    price: 'NT$0',
    period: '永久免費',
    color: 'var(--glass-bg)',
    border: 'var(--glass-border)',
    features: ['5 個連結區塊', '基本分析數據', '1 個頁面', 'cresclab.to/你的名稱'],
    cta: '立即開始',
    highlight: false,
  },
  {
    name: '專業方案',
    price: 'NT$299',
    period: '/ 月',
    color: 'linear-gradient(135deg, rgba(27,111,232,0.25), rgba(59,158,255,0.15))',
    border: 'rgba(59,158,255,0.55)',
    features: ['無限連結區塊', '進階數據分析', '5 個頁面', '自訂網域', 'AI 一鍵生成', '移除品牌浮水印'],
    cta: '免費試用 14 天',
    highlight: true,
  },
  {
    name: '企業方案',
    price: '聯絡我們',
    period: '',
    color: 'var(--glass-bg)',
    border: 'var(--glass-border)',
    features: ['無限頁面與成員', '專屬客戶成功經理', 'SSO 單一登入', 'API 整合', 'SLA 99.9% 保證'],
    cta: '預約 Demo',
    highlight: false,
  },
]

const DEMOS = [
  { handle: 'crescendo', name: '漸強實驗室', role: 'AI MarTech 平台', emoji: '🐦' },
  { handle: 'designer',  name: '王小明設計',  role: 'UI/UX 設計師',   emoji: '🎨' },
  { handle: 'podcast',   name: '行銷煉金術',  role: 'Podcast 主持人', emoji: '🎙️' },
]

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className={styles.page}>
      {/* ── 背景裝飾 ── */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.pelican}>🐦</span>
          <span className={styles.navBrand}>LinkBio</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">功能</a>
          <a href="#pricing">方案</a>
          <a href="#demo">範例</a>
        </div>
        <button className={styles.navCta} onClick={() => nav('/auth')}>
          免費建立頁面
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.dot} />
          全新 AI 功能上線 🎉
        </div>
        <h1 className={styles.heroTitle}>
          打造你的<br />
          <span className={styles.gradient}>專屬連結頁面</span>
        </h1>
        <p className={styles.heroSub}>
          一個連結，承載所有內容。讓粉絲輕鬆找到你的<br />
          社群、作品、商品，以及一切重要資訊。
        </p>
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={() => nav('/auth')}>
            免費開始使用 →
          </button>
          <button className={styles.btnGhost} onClick={() => nav('/p/crescendo')}>
            查看範例頁面
          </button>
        </div>
        <p className={styles.heroNote}>無需信用卡・免費方案永久有效</p>

        {/* 模擬手機 */}
        <div className={styles.phoneWrap}>
          <div className={styles.phone}>
            <div className={styles.phoneNotch} />
            <div className={styles.phoneMini}>
              <div className={styles.miniAvatar}>🐦</div>
              <div className={styles.miniName}>漸強實驗室</div>
              <div className={styles.miniHandle}>@crescendo.lab</div>
              {['MAAC 行銷自動化', 'CAAC 客服 AI', '最新部落格', '預約 Demo'].map(t => (
                <div key={t} className={styles.miniBtn}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 功能 ── */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionLabel}>功能特色</div>
        <h2 className={styles.sectionTitle}>為創作者與品牌<br />量身打造</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo 範例 ── */}
      <section id="demo" className={styles.section}>
        <div className={styles.sectionLabel}>真實案例</div>
        <h2 className={styles.sectionTitle}>看看大家如何使用</h2>
        <div className={styles.demoRow}>
          {DEMOS.map(d => (
            <div
              key={d.handle}
              className={styles.demoCard}
              onClick={() => nav(`/p/${d.handle}`)}
            >
              <div className={styles.demoAvatar}>{d.emoji}</div>
              <div className={styles.demoName}>{d.name}</div>
              <div className={styles.demoRole}>{d.role}</div>
              <div className={styles.demoLink}>查看頁面 →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 方案 ── */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionLabel}>定價方案</div>
        <h2 className={styles.sectionTitle}>選擇適合你的方案</h2>
        <div className={styles.plansRow}>
          {PLANS.map(p => (
            <div
              key={p.name}
              className={`${styles.planCard} ${p.highlight ? styles.planHighlight : ''}`}
              style={{ background: p.color, borderColor: p.border }}
            >
              {p.highlight && <div className={styles.planBadge}>最受歡迎</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>{p.price}<span>{p.period}</span></div>
              <ul className={styles.planFeatures}>
                {p.features.map(f => (
                  <li key={f}><span className={styles.check}>✓</span>{f}</li>
                ))}
              </ul>
              <button
                className={p.highlight ? styles.btnPrimary : styles.btnOutline}
                onClick={() => nav('/auth')}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.pelican2}>🐦</div>
          <h2 className={styles.ctaTitle}>準備好了嗎？</h2>
          <p className={styles.ctaSub}>加入 10,000+ 創作者與品牌，立即打造你的連結頁面</p>
          <button className={styles.btnPrimary} onClick={() => nav('/auth')}>
            免費建立我的頁面
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>🐦 <span>LinkBio</span></div>
        <p className={styles.footerCopy}>© 2025 LinkBio · Powered by Crescendo Lab Design</p>
      </footer>
    </div>
  )
}
