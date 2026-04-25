// pages/TitleScreen.jsx
import { useState, useEffect, useRef } from 'react'
import {
  Link2, Pencil, HelpCircle, XCircle, Clock, X,
  MessageCircle, SlidersHorizontal, CheckCircle, Scissors,
  MapPin, Sparkles, BarChart2, GitMerge, Wand2, RefreshCw,
  Link as LinkIcon, Infinity as InfinityIcon, Zap, BookOpen,
  Home, ShoppingBag, Briefcase, Plane, Train, UtensilsCrossed,
  Cross, GraduationCap, User,
} from 'lucide-react'
import sentences from '../data/sentences.json'
import { PotatoMascot } from '../components/PotatoMascot'
import { useTheme } from '../context/ThemeContext'
import { themes } from '../themes'

const CATEGORY_ICONS = {
  'sein動詞':      Link2,
  '現在形':        Pencil,
  '疑問文':        HelpCircle,
  '否定文':        XCircle,
  '数字と時間':    Clock,
  '会話・挨拶表現': MessageCircle,
  '話法の助動詞':  SlidersHorizontal,
  '現在完了':      CheckCircle,
  '分離動詞':      Scissors,
  '前置詞':        MapPin,
  '未来形':        Sparkles,
  '比較級・最上級': BarChart2,
  '接続詞':        GitMerge,
  '接続法II':      Wand2,
  '受動態':        RefreshCw,
  '関係代名詞':    LinkIcon,
  'zu不定詞':      InfinityIcon,
  '副詞':          Zap,
  '慣用表現':      BookOpen,
}

const SCENE_ICONS = {
  '日常生活':         Home,
  '買い物':           ShoppingBag,
  '仕事・職場':       Briefcase,
  '観光・旅行':       Plane,
  '交通・移動':       Train,
  'レストラン・カフェ': UtensilsCrossed,
  '病院・緊急':       Cross,
  '学校・勉強':       GraduationCap,
  '自己紹介':         User,
}

const LEVEL_META = {
  A1: { bg: 'var(--surface)',  label: '初級',   count: sentences.filter(s => s.level === 'A1').length },
  A2: { bg: 'var(--tab-bg)',   label: '初中級', count: sentences.filter(s => s.level === 'A2').length },
  B1: { bg: 'var(--border)',   label: '中級',   count: sentences.filter(s => s.level === 'B1').length },
}


const LEVELS = ['A1', 'A2', 'B1']
const CATEGORIES = [...new Set(sentences.map(s => s.category))]
const SCENES = [...new Set(sentences.filter(s => s.scene).map(s => s.scene))]

export function TitleScreen({ onStart, weakIds, studyRecord }) {
  const { themeId, setTheme } = useTheme()
  const weakCount = weakIds?.weakIds.length ?? 0

  const [selLevel, setSelLevel] = useState(null)
  const [selCategory, setSelCategory] = useState(null)
  const [selScene, setSelScene] = useState(null)

  const filtered = sentences.filter(s =>
    (!selLevel    || s.level    === selLevel) &&
    (!selCategory || s.category === selCategory) &&
    (!selScene    || s.scene    === selScene)
  )

  const hasFilter = selLevel || selCategory || selScene

  const handleStart = () => {
    if (filtered.length === 0) return
    window.scrollTo(0, 0)
    onStart(filtered)
  }

  const resetFilters = () => {
    setSelLevel(null)
    setSelCategory(null)
    setSelScene(null)
  }

  const startWeak = () => {
    const weak = sentences.filter(s => weakIds.weakIds.includes(s.id))
    if (weak.length === 0) return
    onStart(weak, true)
  }

  return (
    <div className="title-screen" style={{
      background: 'var(--bg)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Barlow', sans-serif",
      padding: '40px 24px 120px',
    }}>
      <div className="title-content" style={{
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>

        {/* ── Mascot ── */}
        <MascotWithBubble />

        {/* ── Logo ── */}
        <div className="logo" style={{ textAlign: 'center' }}>
          <div className="logo-title" style={{
            fontFamily: "'Paytone One', sans-serif",
            fontSize: 56, letterSpacing: '-1px', lineHeight: 1,
            color: 'var(--text)',
          }}>
            Pommes
          </div>
          <div className="logo-subtitle" style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14, letterSpacing: '1.5px', textTransform: 'uppercase',
            color: 'var(--text-sub)', marginTop: 8,
          }}>
            瞬間ドイツ語作文
          </div>
        </div>

        {/* ── Study record ── */}
        <StudyStats record={studyRecord} />

        {/* ── Buttons ── */}
        <div className="start-buttons" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          <button
            onClick={startWeak}
            disabled={weakCount === 0}
            style={{
              ...ghostBtn,
              opacity: weakCount === 0 ? 0.4 : 1,
              cursor: weakCount === 0 ? 'default' : 'pointer',
              justifyContent: 'space-between',
            }}
          >
            <span>苦手問題を復習</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-sub)' }}>
              {weakCount}問
            </span>
          </button>

        </div>

        {/* ── Filter scrolls ── */}
        <LevelCards    selected={selLevel}    onSelect={lv  => setSelLevel(lv   === selLevel    ? null : lv)} label="Level" />
        <CategoryChips selected={selCategory} onSelect={cat => setSelCategory(cat === selCategory ? null : cat)} label="Category" />
        <SceneGrid     selected={selScene}    onSelect={sc  => setSelScene(sc   === selScene    ? null : sc)} label="Scene" />

        {/* ── Theme picker ── */}
        <div className="theme-picker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div className="theme-picker__label" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            color: 'var(--text-muted)',
          }}>
            テーマ
          </div>
          <div className="theme-picker__swatches" style={{ display: 'flex', gap: 10 }}>
            {Object.entries(themes).map(([id, t]) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                title={t.name}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: t.swatch,
                  border: themeId === id
                    ? '3px solid var(--border-strong)'
                    : '2px solid var(--border)',
                  cursor: 'pointer', padding: 0,
                  boxShadow: themeId === id ? '0 0 0 2px var(--bg)' : 'none',
                  transition: 'all .15s',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="footer" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.54px',
          textTransform: 'uppercase',
        }}>
          <span>{sentences.length} Sätze · A1–B1</span>
          <a href="privacy.html" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            プライバシーポリシー
          </a>
        </div>
      </div>

      {/* ── Fixed bottom start bar ── */}
      <div className="start-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '32px 24px 12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(to bottom, transparent, var(--bg) 40%)',
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 50,
        pointerEvents: 'none',
      }}>
        {hasFilter && (
          <button
            onClick={resetFilters}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.5px', padding: '4px',
              alignSelf: 'center',
              marginTop: 24,
              pointerEvents: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <X size={13} strokeWidth={2} />
            フィルターをリセット
          </button>
        )}
        <button
          onClick={handleStart}
          disabled={filtered.length === 0}
          style={{
            ...solidBtn,
            marginTop: hasFilter ? 0 : 24,
            pointerEvents: 'auto',
            opacity: filtered.length === 0 ? 0.4 : 1,
            cursor: filtered.length === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>{hasFilter ? 'スタート' : 'すぐはじめる'}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
            {filtered.length}問
          </span>
        </button>
      </div>

    </div>
  )
}

/* ── Study stats ── */
function StudyStats({ record }) {
  if (!record?.lastStudyDate) return null

  const { streak = 1, todaySolved = 0, totalSolved = 0 } = record

  const items = [
    { n: todaySolved, label: 'Today', badge: streak > 1 ? `🔥 ${streak}日連続` : null },
    { n: totalSolved, label: 'Total', badge: null },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '8px 0' }}>
      {items.map(({ n, label, badge }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10, color: 'var(--text-sub)',
            letterSpacing: '0.3px', marginBottom: 4,
            visibility: badge ? 'visible' : 'hidden',
          }}>
            {badge ?? 'placeholder'}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 24, fontWeight: 600, color: 'var(--text)',
            letterSpacing: '-0.4px',
          }}>
            {n}
          </div>
          <div style={{
            fontSize: 10, textTransform: 'uppercase',
            letterSpacing: '1.5px', color: 'var(--text-sub)', marginTop: 4,
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Speech bubble + mascot ── */
const GREETINGS = [
  'Hallo!',
  "Wie geht's?",
  'Guten Tag!',
  'Servus!',
  'Moin!',
  'Na?',
  'Willkommen!',
  "Los geht's!",
]

function MascotWithBubble() {
  const [text, setText] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setText(prev => {
          const options = GREETINGS.filter(g => g !== prev)
          return options[Math.floor(Math.random() * options.length)]
        })
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="mascot-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="speech-bubble" style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity .25s ease',
        background: 'var(--surface)', color: 'var(--text)',
        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
        fontSize: 13, padding: '7px 16px',
        borderRadius: 50, marginBottom: 18,
        whiteSpace: 'nowrap', position: 'relative',
      }}>
        {text}
        <span className="speech-bubble__tail" style={{
          position: 'absolute', bottom: -7, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid var(--surface)',
        }} />
      </div>
      <PotatoMascot variant="blink-no-mouth" />
    </div>
  )
}

/* ── Shared filter section label ── */
function FilterSection({ label, children }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        fontSize: 11, color: 'var(--text-muted)',
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: '0.8px', textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

/* ── Level: 3 equal cards ── */
function LevelCards({ selected, onSelect, label }) {
  const { theme } = useTheme()
  return (
    <FilterSection label={label}>
      <div style={{ display: 'flex', gap: 10 }}>
        {LEVELS.map(lv => {
          const meta = LEVEL_META[lv]
          const isSelected = selected === lv
          const levelColor = theme.levelColors?.[lv]
          const cardBg = isSelected ? 'var(--selected-bg)' : (levelColor?.bg ?? meta.bg)
          const textColor = isSelected ? 'var(--selected-text)' : 'var(--text)'
          const subColor = isSelected ? 'var(--selected-text)' : 'var(--text)'
          return (
            <button
              key={lv}
              onClick={() => onSelect(lv)}
              style={{
                flex: 1,
                background: cardBg,
                border: 'none', borderRadius: 20,
                padding: '18px 14px',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'background .15s',
              }}
            >
              <div style={{
                fontFamily: "'Paytone One', sans-serif",
                fontSize: 32, lineHeight: 1,
                color: textColor,
                letterSpacing: '-1px',
              }}>
                {lv}
              </div>
              <div style={{
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: subColor,
                opacity: isSelected ? 0.85 : 1,
              }}>
                {meta.label}
              </div>
              <div style={{
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                color: subColor,
                opacity: isSelected ? 0.65 : 1,
              }}>
                {meta.count}問
              </div>
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}

/* ── Category: wrapping chips with collapse ── */
const CATEGORY_INITIAL_COUNT = 10

function CategoryChips({ selected, onSelect, label }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, CATEGORY_INITIAL_COUNT)
  const hiddenCount = CATEGORIES.length - CATEGORY_INITIAL_COUNT

  return (
    <FilterSection label={label}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {visible.map(cat => {
          const isSelected = selected === cat
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              style={{
                padding: '6px 14px',
                background: isSelected ? 'var(--selected-bg)' : 'var(--surface)',
                border: 'none', borderRadius: 50,
                cursor: 'pointer',
                fontSize: 12, fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                color: isSelected ? 'var(--selected-text)' : 'var(--text)',
                transition: 'background .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          )
        })}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              padding: '6px 14px',
              background: 'none',
              border: '1.5px dashed var(--border)',
              borderRadius: 50,
              cursor: 'pointer',
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            +{hiddenCount}
          </button>
        )}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              padding: '6px 14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            閉じる
          </button>
        )}
      </div>
    </FilterSection>
  )
}

/* ── Scene: 3-column grid ── */
function SceneGrid({ selected, onSelect, label }) {
  const { theme } = useTheme()
  const scenes = SCENES.filter(sc => sentences.some(s => s.scene === sc))
  return (
    <FilterSection label={label}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridAutoRows: '100px', gap: 10 }}>
        {scenes.map(sc => {
          const Icon = SCENE_ICONS[sc]
          const isSelected = selected === sc
          const sceneColor = theme.sceneColors?.[sc]
          const cardBg = isSelected ? 'var(--selected-bg)' : 'var(--surface)'
          const textColor = isSelected ? 'var(--selected-text)' : 'var(--text)'
          const iconBg = isSelected ? 'rgba(255,255,255,0.15)' : (sceneColor?.bg ?? 'var(--tab-bg)')
          const iconColor = isSelected ? 'var(--selected-text)' : (sceneColor?.text ?? 'var(--text)')
          return (
            <button
              key={sc}
              onClick={() => onSelect(sc)}
              style={{
                background: cardBg,
                border: 'none', borderRadius: 20,
                padding: '14px 10px',
                cursor: 'pointer', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'background .15s',
              }}
            >
              <div style={{ ...iconBadge, background: iconBg }}>
                {Icon && <Icon size={15} color={iconColor} />}
              </div>
              <div style={{
                fontSize: 11, fontFamily: "'Barlow', sans-serif",
                fontWeight: 600, lineHeight: 1.3,
                color: textColor,
              }}>
                {sc}
              </div>
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}

const iconBadge = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'var(--tab-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

/* ── Styles ── */
const solidBtn = {
  width: '100%', padding: '15px 24px',
  background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
}
const ghostBtn = {
  width: '100%', padding: '13px 24px',
  background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400,
  fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
