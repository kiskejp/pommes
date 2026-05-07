import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, Linking,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Link2, Pencil, HelpCircle, XCircle, Clock,
  MessageCircle, SlidersHorizontal, CheckCircle, Scissors,
  MapPin, Sparkles, BarChart2, GitMerge, Wand2, RefreshCw,
  Link as LinkIcon, Infinity as InfinityIcon, Zap, BookOpen,
  Home, ShoppingBag, Briefcase, Plane, Train, UtensilsCrossed,
  Cross, GraduationCap, User, X,
} from 'lucide-react-native'
import { RiveMascot } from '../components/RiveMascot'
import { HowToModal } from '../components/HowToModal'
import { Fonts } from '../fonts'
import sentences from '../data/sentences.json'

const CATEGORY_ICONS = {
  'sein動詞':       Link2,
  '現在形':         Pencil,
  '疑問文':         HelpCircle,
  '否定文':         XCircle,
  '数字と時間':     Clock,
  '会話・挨拶表現': MessageCircle,
  '話法の助動詞':   SlidersHorizontal,
  '現在完了':       CheckCircle,
  '分離動詞':       Scissors,
  '前置詞':         MapPin,
  '未来形':         Sparkles,
  '比較級・最上級': BarChart2,
  '接続詞':         GitMerge,
  '接続法II':       Wand2,
  '受動態':         RefreshCw,
  '関係代名詞':     LinkIcon,
  'zu不定詞':       InfinityIcon,
  '副詞':           Zap,
  '慣用表現':       BookOpen,
}

const SCENE_ICONS = {
  '日常生活':           Home,
  '買い物':             ShoppingBag,
  '仕事・職場':         Briefcase,
  '観光・旅行':         Plane,
  '交通・移動':         Train,
  'レストラン・カフェ': UtensilsCrossed,
  '病院・緊急':         Cross,
  '学校・勉強':         GraduationCap,
  '自己紹介':           User,
}

const LEVELS = ['A1', 'A2', 'B1']
const LEVEL_META = {
  A1: { label: '初級',   count: sentences.filter(s => s.level === 'A1').length, bars: 1 },
  A2: { label: '初中級', count: sentences.filter(s => s.level === 'A2').length, bars: 2 },
  B1: { label: '中級',   count: sentences.filter(s => s.level === 'B1').length, bars: 3 },
}
const CATEGORIES = [...new Set(sentences.map(s => s.category))]
const SCENES     = [...new Set(sentences.filter(s => s.scene).map(s => s.scene))]

const GREETINGS = [
  'Hallo!', "Wie geht's?", 'Guten Tag!', 'Servus!',
  'Moin!', 'Na?', 'Willkommen!', "Los geht's!",
]

const CATEGORY_INITIAL_COUNT = 10

/* ── MascotWithBubble ── */
function MascotWithBubble({ theme: t }) {
  const [text, setText] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const cycle = () => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setText(prev => {
          const opts = GREETINGS.filter(g => g !== prev)
          return opts[Math.floor(Math.random() * opts.length)]
        })
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
      })
    }
    const id = setInterval(cycle, 5000)
    return () => clearInterval(id)
  }, [opacity])

  return (
    <View style={styles.mascotWrapper}>
      <Animated.View style={[styles.bubble, { backgroundColor: t.surface, opacity }]}>
        <Text style={[styles.bubbleText, { color: t.text, fontFamily: Fonts.monoSemi }]}>{text}</Text>
        <View style={[styles.bubbleTail, { borderTopColor: t.surface }]} />
      </Animated.View>
      <RiveMascot size={160} scene={0} />
    </View>
  )
}

/* ── StudyStats ── */
function StudyStats({ record, theme: t }) {
  if (!record?.lastStudyDate) return null
  const { streak = 1, todaySolved = 0, totalSolved = 0 } = record
  const items = [
    { n: streak,      label: 'Streak', icon: Zap, iconColor: '#8b5cf6' },
    { n: todaySolved, label: 'Today',  icon: null },
    { n: totalSolved, label: 'Total',  icon: null },
  ]
  return (
    <View style={[styles.statsRow, { marginTop: 20 }]}>
      {items.map(({ n, label, icon: Icon, iconColor }) => (
        <View key={label} style={styles.statsItem}>
          <View style={styles.statsNumRow}>
            {Icon && <Icon size={13} strokeWidth={2.5} color={iconColor} />}
            <Text style={[styles.statsNumber, { color: t.text, fontFamily: Fonts.monoSemi }]}>{n}</Text>
          </View>
          <Text style={[styles.statsLabel, { color: t.textSub, fontFamily: Fonts.monoReg }]}>{label}</Text>
        </View>
      ))}
    </View>
  )
}

/* ── LevelCards ── */
function LevelCards({ selected, onSelect, theme: t }) {
  return (
    <SectionLabel label="Level">
      <View style={styles.levelRow}>
        {LEVELS.map(lv => {
          const meta = LEVEL_META[lv]
          const isSelected = selected === lv
          const lc = t.levelColors?.[lv]
          const cardBg = isSelected ? t.selectedBg : (lc?.bg ?? t.surface)
          const textColor = isSelected ? t.selectedText : t.text
          const subColor  = isSelected ? t.selectedText : t.textSub
          const barFill   = isSelected ? 'rgba(255,255,255,0.9)' : (lc?.text ?? t.text)
          const barEmpty  = isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)'
          return (
            <TouchableOpacity
              key={lv}
              onPress={() => onSelect(lv)}
              style={[styles.levelCard, { backgroundColor: cardBg, flex: 1 }]}
            >
              <Text style={[styles.levelName, { color: textColor, fontFamily: Fonts.paytone }]}>{lv}</Text>
              <Text style={[styles.levelLabel, { color: subColor, fontFamily: Fonts.monoSemi }]}>{meta.label}</Text>
              <View style={styles.levelFooter}>
                <Text style={[styles.levelCount, { color: subColor, fontFamily: Fonts.monoReg }]}>{meta.count}問</Text>
                <View style={styles.bars}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <View key={i} style={[
                      styles.bar,
                      {
                        height: 6 + i * 5,
                        backgroundColor: i < meta.bars ? barFill : barEmpty,
                        opacity: (!isSelected && i < meta.bars) ? 0.35 : 1,
                      },
                    ]} />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </SectionLabel>
  )
}

/* ── CategoryChips ── */
function CategoryChips({ selected, onSelect, theme: t }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, CATEGORY_INITIAL_COUNT)
  const hiddenCount = CATEGORIES.length - CATEGORY_INITIAL_COUNT

  return (
    <SectionLabel label="Category">
      <View style={styles.chipWrap}>
        {visible.map(cat => {
          const isSelected = selected === cat
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              style={[
                styles.chip,
                { backgroundColor: isSelected ? t.selectedBg : t.surface },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                styles.chipText,
                { color: isSelected ? t.selectedText : t.text, fontFamily: Fonts.barlowSemi },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )
        })}
        {!expanded && hiddenCount > 0 && (
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            style={[styles.chip, { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.border }]}
          >
            <Text style={[styles.chipText, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>+{hiddenCount}</Text>
          </TouchableOpacity>
        )}
        {expanded && (
          <TouchableOpacity onPress={() => setExpanded(false)}>
            <Text style={[styles.chipText, { color: t.textMuted, fontFamily: Fonts.monoReg, padding: 6 }]}>閉じる</Text>
          </TouchableOpacity>
        )}
      </View>
    </SectionLabel>
  )
}

/* ── SceneGrid ── */
function SceneGrid({ selected, onSelect, theme: t }) {
  const scenes = SCENES.filter(sc => sentences.some(s => s.scene === sc))
  return (
    <SectionLabel label="Scene">
      <View style={styles.sceneGrid}>
        {scenes.map(sc => {
          const Icon = SCENE_ICONS[sc]
          const isSelected = selected === sc
          const sc_ = t.sceneColors?.[sc]
          const cardBg  = isSelected ? t.selectedBg : t.surface
          const iconBg  = isSelected ? 'rgba(255,255,255,0.15)' : (sc_?.bg ?? t.tabBg)
          const iconCol = isSelected ? t.selectedText : (sc_?.text ?? t.text)
          const textCol = isSelected ? t.selectedText : t.text
          return (
            <TouchableOpacity
              key={sc}
              onPress={() => onSelect(sc)}
              style={[styles.sceneCard, { backgroundColor: cardBg }]}
            >
              <View style={[styles.sceneIconBadge, { backgroundColor: iconBg }]}>
                {Icon && <Icon size={15} color={iconCol} />}
              </View>
              <Text style={[styles.sceneLabel, { color: textCol, fontFamily: Fonts.barlowSemi }]}>
                {sc}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SectionLabel>
  )
}

/* ── SectionLabel ── */
function SectionLabel({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  )
}

/* ── TitleScreen ── */
export function TitleScreen({ onStart, weakIds, studyRecord, theme: t, themes, onThemeChange }) {
  const [selLevel,    setSelLevel]    = useState(null)
  const [selCategory, setSelCategory] = useState(null)
  const [selScene,    setSelScene]    = useState(null)
  const [showHelp,    setShowHelp]    = useState(false)

  const weakCount = weakIds?.weakIds.length ?? 0

  const filtered = sentences.filter(s =>
    (!selLevel    || s.level    === selLevel) &&
    (!selCategory || s.category === selCategory) &&
    (!selScene    || s.scene    === selScene)
  )
  const hasFilter = selLevel || selCategory || selScene

  const handleStart = () => {
    if (filtered.length === 0) return
    onStart(filtered)
  }

  const startWeak = () => {
    const weak = sentences.filter(s => weakIds.weakIds.includes(s.id))
    if (weak.length === 0) return
    onStart(weak)
  }

  const resetFilters = () => {
    setSelLevel(null)
    setSelCategory(null)
    setSelScene(null)
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Help button — top right */}
      <TouchableOpacity
        onPress={() => setShowHelp(true)}
        style={styles.helpBtn}
      >
        <HelpCircle size={20} strokeWidth={2} color={t.textSub} />
      </TouchableOpacity>

      <HowToModal visible={showHelp} onClose={() => setShowHelp(false)} theme={t} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: weakCount > 0 ? 180 : 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <MascotWithBubble theme={t} />
        <StudyStats record={studyRecord} theme={t} />

        <LevelCards
          selected={selLevel}
          onSelect={lv => setSelLevel(lv === selLevel ? null : lv)}
          theme={t}
        />
        <CategoryChips
          selected={selCategory}
          onSelect={cat => setSelCategory(cat === selCategory ? null : cat)}
          theme={t}
        />
        <SceneGrid
          selected={selScene}
          onSelect={sc => setSelScene(sc === selScene ? null : sc)}
          theme={t}
        />

        {/* Theme picker */}
        {themes && onThemeChange && (
          <View style={styles.themePicker}>
            <Text style={[styles.themePickerLabel, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>テーマ</Text>
            <View style={styles.swatches}>
              {Object.entries(themes).map(([id, th]) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => onThemeChange(id)}
                  style={[
                    styles.swatch,
                    { backgroundColor: th.swatch },
                    t.name === th.name
                      ? { borderWidth: 3, borderColor: t.borderStrong }
                      : { borderWidth: 2, borderColor: t.border },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>
            {sentences.length} Sätze · A1–B1
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://kiskejp.github.io/pommes/privacy.html')}>
            <Text style={[styles.privacyLink, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>
              プライバシーポリシー
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed bottom start bar */}
      <View style={[styles.startBar, { backgroundColor: 'transparent' }]} pointerEvents="box-none">
        {/* Gradient fade: transparent → bg over full 40px height (no solid portion = no fake whitespace) */}
        <LinearGradient
          colors={[hexToRgba(t.bg, 0), t.bg]}
          locations={[0, 1]}
          style={styles.gradientFade}
          pointerEvents="none"
        />
        <View style={[styles.startBarInner, { backgroundColor: t.bg }]}>
          {hasFilter && (
            <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
              <X size={13} strokeWidth={2} color={t.textMuted} />
              <Text style={[styles.resetText, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>
                フィルターをリセット
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleStart}
            disabled={filtered.length === 0}
            style={[
              styles.solidBtn,
              { backgroundColor: t.solidBg, opacity: filtered.length === 0 ? 0.4 : 1 },
            ]}
          >
            <Text style={[styles.solidBtnText, { color: t.solidText, fontFamily: Fonts.monoSemi }]}>
              {hasFilter ? 'スタート' : 'すぐはじめる'}
            </Text>
            <Text style={[styles.solidBtnCount, { color: t.solidText, fontFamily: Fonts.monoReg }]}>
              {filtered.length}問
            </Text>
          </TouchableOpacity>
          {weakCount > 0 && (
            <TouchableOpacity
              onPress={startWeak}
              style={[styles.ghostBtn, { backgroundColor: t.surface }]}
            >
              <Text style={[styles.ghostBtnText, { color: t.text, fontFamily: Fonts.monoSemi }]}>苦手問題を復習</Text>
              <Text style={[styles.ghostBtnCount, { color: t.textSub, fontFamily: Fonts.monoReg }]}>{weakCount}問</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  helpBtn: {
    position: 'absolute', top: 12, right: 16,
    zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 28,
  },

  /* Mascot */
  mascotWrapper: { alignItems: 'center' },
  bubble: {
    paddingVertical: 7, paddingHorizontal: 16,
    borderRadius: 50, marginBottom: 18,
    position: 'relative',
  },
  bubbleText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  bubbleTail: {
    position: 'absolute', bottom: -7, alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 6,  borderLeftColor:  'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 7,
  },

  /* Stats */
  statsRow:    { flexDirection: 'row', gap: 32, alignItems: 'flex-end' },
  statsItem:   { alignItems: 'center', gap: 4 },
  statsNumRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsNumber: { fontSize: 20, fontWeight: '600', letterSpacing: -0.4 },
  statsLabel:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2 },

  /* Section */
  section:      { width: '100%', gap: 10 },
  sectionLabel: {
    fontSize: 11, color: '#9ca3af',
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  /* Level */
  levelRow:   { flexDirection: 'row', gap: 10 },
  levelCard:  { borderRadius: 20, padding: 16, gap: 6 },
  levelName:  { fontSize: 30, lineHeight: 30, letterSpacing: -1 },
  levelLabel: { fontSize: 11, fontWeight: '600' },
  levelFooter:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  levelCount: { fontSize: 11 },
  bars:       { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar:        { width: 6, borderRadius: 2 },

  /* Category chips */
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 50,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  /* Scene grid */
  sceneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sceneCard: {
    width: '31%',
    borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 8,
    minHeight: 90, justifyContent: 'center',
  },
  sceneIconBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  sceneLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },

  /* Theme picker */
  themePicker:      { alignItems: 'center', gap: 10 },
  themePickerLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  swatches:         { flexDirection: 'row', gap: 10 },
  swatch:           { width: 28, height: 28, borderRadius: 14 },

  /* Footer */
  footer:      { alignItems: 'center', gap: 8 },
  footerText:  { fontSize: 10, letterSpacing: 0.54, textTransform: 'uppercase' },
  privacyLink: { fontSize: 10, letterSpacing: 0.54, textDecorationLine: 'underline' },

  /* Start bar */
  startBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    pointerEvents: 'box-none',
  },
  gradientFade: {
    height: 40,
  },
  startBarInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
    gap: 8,
  },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'center', paddingVertical: 4,
  },
  resetText: { fontSize: 11, letterSpacing: 0.5 },
  solidBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 50, paddingVertical: 15, paddingHorizontal: 24,
  },
  solidBtnText:  { fontSize: 14, fontWeight: '600', letterSpacing: 0.54, textTransform: 'uppercase' },
  solidBtnCount: { fontSize: 11 },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 50, paddingVertical: 13, paddingHorizontal: 24,
  },
  ghostBtnText:  { fontSize: 14, fontWeight: '600', letterSpacing: 0.54, textTransform: 'uppercase' },
  ghostBtnCount: { fontSize: 11 },
})

/** hex (#fff or #ffffff) → rgba(r,g,b,alpha) — avoids transparent-black on iOS LinearGradient */
function hexToRgba(hex, alpha) {
  const full = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3')
  const r = parseInt(full.slice(1, 3), 16)
  const g = parseInt(full.slice(3, 5), 16)
  const b = parseInt(full.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
