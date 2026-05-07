// components/HowToModal.jsx
import { useEffect } from 'react'
import { X, Eye, Keyboard, Zap } from 'lucide-react'

const STEPS = [
  {
    icon: Eye,
    title: 'カードモード',
    desc: '日本語を見てドイツ語を思い浮かべ、カードを開いて答え合わせ。音声で発音も確認できます。',
  },
  {
    icon: Keyboard,
    title: '入力モード',
    desc: 'ドイツ語をタイピングして採点。ä ö ü ß ボタンで特殊文字も入力できます。',
  },
  {
    icon: Zap,
    title: '苦手問題',
    desc: '間違えた問題は自動で記録。「苦手問題を復習」で集中練習できます。',
  },
]

export function HowToModal({ onClose }) {
  // ESC キーで閉じる
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn .15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640,
          background: 'var(--bg)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 28px max(28px, env(safe-area-inset-bottom))',
          animation: 'slideUp .2s ease',
        }}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <span style={{
            fontFamily: "'Paytone One', sans-serif",
            fontSize: 18, letterSpacing: '-0.3px',
            color: 'var(--text)',
          }}>
            使い方
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface)', border: 'none',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-sub)',
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ステップ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} strokeWidth={2} color="var(--text)" />
              </div>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--text)', letterSpacing: '-0.1px',
                  marginBottom: 4,
                }}>
                  {title}
                </div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 14, lineHeight: 1.6,
                  color: 'var(--text-sub)',
                }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  )
}
