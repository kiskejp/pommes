import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native'
import { Mascot } from '../components/Mascot'
import sentences from '../data/sentences.json'

const GREETINGS = [
  'Hallo!', "Wie geht's?", 'Guten Tag!', 'Servus!',
  'Moin!', 'Na?', 'Willkommen!', "Los geht's!",
]

function MascotWithBubble({ theme: t }) {
  const [text, setText] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const cycle = () => {
      // フェードアウト
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setText(prev => {
          const opts = GREETINGS.filter(g => g !== prev)
          return opts[Math.floor(Math.random() * opts.length)]
        })
        // フェードイン
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
      })
    }
    const id = setInterval(cycle, 4000)
    return () => clearInterval(id)
  }, [opacity])

  return (
    <View style={bubble.wrapper}>
      {/* 吹き出し */}
      <Animated.View style={[bubble.balloon, { backgroundColor: t?.surface ?? '#f8f8f8', opacity }]}>
        <Text style={[bubble.text, { color: t?.text ?? '#000' }]}>{text}</Text>
        {/* 三角しっぽ */}
        <View style={[bubble.tail, { borderTopColor: t?.surface ?? '#f8f8f8' }]} />
      </Animated.View>
      <Mascot size={80} variant="blink-no-mouth" animation="float" />
    </View>
  )
}

const bubble = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  balloon: {
    paddingVertical: 7, paddingHorizontal: 16,
    borderRadius: 50, marginBottom: 14,
    position: 'relative',
  },
  text: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  tail: {
    position: 'absolute', bottom: -7, alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 6, borderLeftColor: 'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 7,
  },
})

const LEVELS = ['A1', 'A2', 'B1']
const CATEGORIES = [...new Set(sentences.map(s => s.category))]
const SCENES = [...new Set(sentences.filter(s => s.scene).map(s => s.scene))]

export function TitleScreen({ onStart, weakIds, studyRecord, theme, onThemeChange, themes, mode, onModeChange }) {
  const [expanded, setExpanded] = useState(null)
  const weakCount = weakIds?.weakIds.length ?? 0

  const t = theme ?? defaultTheme

  const toggle = (key) => setExpanded(prev => prev === key ? null : key)

  const start = (filter) => {
    let filtered
    if (!filter) {
      filtered = sentences
    } else if (filter.level) {
      filtered = sentences.filter(s => s.level === filter.level)
    } else if (filter.category) {
      filtered = sentences.filter(s => s.category === filter.category)
    } else {
      filtered = sentences.filter(s => s.scene === filter.scene)
    }
    onStart(filtered)
  }

  const startWeak = () => {
    const weak = sentences.filter(s => weakIds.weakIds.includes(s.id))
    if (weak.length === 0) return
    onStart(weak)
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: t.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Mascot + 吹き出し */}
      <MascotWithBubble theme={t} />

      {/* Logo */}
      <Text style={[styles.logoTitle, { color: t.text }]}>Pommes</Text>
      <Text style={[styles.logoSub, { color: t.textSub }]}>瞬間ドイツ語作文</Text>

      {/* Study record */}
      {studyRecord?.lastStudyDate && (
        <StudyStats record={studyRecord} theme={t} />
      )}

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.solidBtn, { backgroundColor: t.solidBg }]}
          onPress={() => start(null)}
        >
          <Text style={[styles.solidBtnText, { color: t.solidText }]}>すぐはじめる</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ghostBtn, { borderColor: t.border, backgroundColor: t.bg }, weakCount === 0 && styles.disabled]}
          onPress={startWeak}
          disabled={weakCount === 0}
        >
          <Text style={[styles.ghostBtnText, { color: t.text }]}>苦手問題を復習</Text>
          <Text style={[styles.ghostBtnSub, { color: t.textSub }]}>{weakCount}問</Text>
        </TouchableOpacity>

        {/* Level */}
        <View>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: expanded === 'level' ? t.borderStrong : t.border, backgroundColor: t.bg }]}
            onPress={() => toggle('level')}
          >
            <Text style={[styles.ghostBtnText, { color: t.text }]}>レベルから選ぶ</Text>
            <Text style={{ color: t.textSub }}>{expanded === 'level' ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded === 'level' && (
            <View style={[styles.subPanel, { borderColor: t.border }]}>
              {LEVELS.map(lv => (
                <TouchableOpacity
                  key={lv}
                  style={[styles.subItem, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                  onPress={() => start({ level: lv })}
                >
                  <Text style={[styles.subItemText, { color: t.text, fontWeight: '600' }]}>{lv}</Text>
                  <Text style={[styles.subItemCount, { color: t.textSub }]}>
                    {sentences.filter(s => s.level === lv).length}問
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Category */}
        <View>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: expanded === 'category' ? t.borderStrong : t.border, backgroundColor: t.bg }]}
            onPress={() => toggle('category')}
          >
            <Text style={[styles.ghostBtnText, { color: t.text }]}>カテゴリから選ぶ</Text>
            <Text style={{ color: t.textSub }}>{expanded === 'category' ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded === 'category' && (
            <View style={[styles.subPanel, { borderColor: t.border }]}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.subItem, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                  onPress={() => start({ category: cat })}
                >
                  <Text style={[styles.subItemText, { color: t.text }]}>{cat}</Text>
                  <Text style={[styles.subItemCount, { color: t.textSub }]}>
                    {sentences.filter(s => s.category === cat).length}問
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Scene */}
        <View>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: expanded === 'scene' ? t.borderStrong : t.border, backgroundColor: t.bg }]}
            onPress={() => toggle('scene')}
          >
            <Text style={[styles.ghostBtnText, { color: t.text }]}>シーンから選ぶ</Text>
            <Text style={{ color: t.textSub }}>{expanded === 'scene' ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded === 'scene' && (
            <View style={[styles.subPanel, { borderColor: t.border }]}>
              {SCENES.map(sc => {
                const count = sentences.filter(s => s.scene === sc).length
                if (count === 0) return null
                return (
                  <TouchableOpacity
                    key={sc}
                    style={[styles.subItem, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                    onPress={() => start({ scene: sc })}
                  >
                    <Text style={[styles.subItemText, { color: t.text }]}>{sc}</Text>
                    <Text style={[styles.subItemCount, { color: t.textSub }]}>{count}問</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </View>

      {/* Mode picker */}
      {onModeChange && (
        <View style={styles.modePicker}>
          <Text style={[styles.themeLabel, { color: t.textMuted }]}>モード</Text>
          <View style={[styles.modeRow, { borderColor: t.border }]}>
            {[{ id: 'card', label: 'カード' }, { id: 'input', label: '入力' }].map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                onPress={() => onModeChange(id)}
                style={[
                  styles.modeBtn,
                  mode === id
                    ? { backgroundColor: t.solidBg }
                    : { backgroundColor: 'transparent' },
                ]}
              >
                <Text style={[
                  styles.modeBtnText,
                  { color: mode === id ? t.solidText : t.textSub }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Theme picker */}
      {themes && onThemeChange && (
        <View style={styles.themePicker}>
          <Text style={[styles.themeLabel, { color: t.textMuted }]}>テーマ</Text>
          <View style={styles.themeSwatches}>
            {Object.entries(themes).map(([id, th]) => (
              <TouchableOpacity
                key={id}
                onPress={() => onThemeChange(id)}
                style={[
                  styles.swatch,
                  { backgroundColor: th.swatch },
                  theme?.name === th.name
                    ? { borderWidth: 3, borderColor: t.borderStrong }
                    : { borderWidth: 2, borderColor: t.border },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={[styles.footer, { color: t.textMuted }]}>{sentences.length} Sätze · A1–B1</Text>
    </ScrollView>
  )
}

function StudyStats({ record, theme: t }) {
  const { streak = 1, todaySolved = 0, totalSolved = 0 } = record
  const items = [
    { n: todaySolved, label: '今日', badge: streak > 1 ? `🔥 ${streak}日連続` : null },
    { n: totalSolved, label: '累計', badge: null },
  ]
  return (
    <View style={styles.statsRow}>
      {items.map(({ n, label, badge }) => (
        <View key={label} style={styles.statsItem}>
          <Text style={[styles.statsBadge, { color: t.textSub, opacity: badge ? 1 : 0 }]}>
            {badge ?? ' '}
          </Text>
          <Text style={[styles.statsNumber, { color: t.text }]}>{n}</Text>
          <Text style={[styles.statsLabel, { color: t.textSub }]}>{label}</Text>
        </View>
      ))}
    </View>
  )
}

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999', textMuted: '#bbb',
  solidBg: '#000', solidText: '#fff',
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 20,
  },
  logoTitle: {
    fontSize: 52, fontWeight: '800', letterSpacing: -1,
  },
  logoSub: {
    fontSize: 12, letterSpacing: 1.5,
    textTransform: 'uppercase', marginTop: -12,
  },
  statsRow: { flexDirection: 'row', gap: 40, paddingVertical: 8 },
  statsItem: { alignItems: 'center' },
  statsBadge: { fontSize: 10, letterSpacing: 0.3, marginBottom: 4 },
  statsNumber: { fontSize: 24, fontWeight: '600', letterSpacing: -0.4 },
  statsLabel: {
    fontSize: 10, textTransform: 'uppercase',
    letterSpacing: 1.5, marginTop: 4,
  },
  buttonGroup: { width: '100%', gap: 10 },
  solidBtn: {
    borderRadius: 50, paddingVertical: 15,
    paddingHorizontal: 24, alignItems: 'center',
  },
  solidBtnText: {
    fontSize: 13, fontWeight: '600',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  ghostBtn: {
    borderWidth: 2, borderRadius: 50,
    paddingVertical: 13, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ghostBtnText: {
    fontSize: 13, fontWeight: '400',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  ghostBtnSub: { fontSize: 11 },
  disabled: { opacity: 0.4 },
  subPanel: {
    marginTop: 6, borderWidth: 1, borderRadius: 12, overflow: 'hidden',
  },
  subItem: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderBottomWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  subItemText: { fontSize: 14 },
  subItemCount: { fontSize: 11 },
  modePicker: { alignItems: 'center', gap: 8 },
  modeRow: {
    flexDirection: 'row', borderWidth: 2, borderRadius: 50, overflow: 'hidden',
  },
  modeBtn: { paddingVertical: 8, paddingHorizontal: 24 },
  modeBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  themePicker: { alignItems: 'center', gap: 10 },
  themeLabel: {
    fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5,
  },
  themeSwatches: { flexDirection: 'row', gap: 10 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  footer: {
    fontSize: 10, letterSpacing: 0.54, textTransform: 'uppercase',
  },
})
