import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native'
import {
  Volume2, VolumeX, Lightbulb, Play, Pause, X, RotateCcw, Bookmark,
} from 'lucide-react-native'
import { useSession } from '../hooks/useSession'
import { useTTS } from '../hooks/useTTS'
import { useAutoPlay } from '../hooks/useAutoPlay'
import { useAudioSettings } from '../hooks/useAudioSettings'
import { RiveMascot } from '../components/RiveMascot'
import { Fonts } from '../fonts'

const MILESTONES = {
  10: 'Gut gemacht!',
  20: 'Weiter so!',
  30: 'Super!',
  50: 'Fantastisch!',
  100: 'Unglaublich!',
}

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999', textMuted: '#ccc',
  solidBg: '#000', solidText: '#fff', tabBg: '#e8eaed',
}

export function StudyScreen({ sentences, onComplete, onExit, addResult, theme, weakIds, mode, onModeChange }) {
  const t = theme ?? defaultTheme
  const session = useSession(sentences)
  const { speak, speaking, cancel } = useTTS()
  const [pauseDuration, setPauseDuration] = useState(2)
  const { jpEnabled, deEnabled, toggleJp, toggleDe } = useAudioSettings()

  const { current, ok, ng, done, revealed, showHint } = session

  // Toast state
  const [toast, setToast] = useState(null) // { msg, variant }
  const toastAnim = useRef(new Animated.Value(0)).current
  const prevOkRef = useRef(ok)
  const prevWasWrong = useRef(false)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg, variant) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, variant })
    toastAnim.setValue(0)
    // App版と同じ cubic-bezier(0.34, 1.56, 0.64, 1) に近いバネ
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 34,
      friction: 7,
    }).start()
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null))
    }, 3500)
  }, [toastAnim])

  // Milestone toast
  useEffect(() => {
    if (ok === prevOkRef.current) return
    prevOkRef.current = ok
    const msg = MILESTONES[ok]
    if (msg) showToast(msg, 'happy')
  }, [ok, showToast])

  // Cleanup toast timer
  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  const smartSpeak = useCallback((text, lang, onEnd) => {
    speak(text, lang, onEnd)
  }, [speak])

  const autoPlay = useAutoPlay({ session, speak: smartSpeak, pauseDuration })

  useEffect(() => {
    if (current && !autoPlay.isPlaying && jpEnabled) {
      const t2 = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(t2)
    }
  }, [current?.id]) // eslint-disable-line

  useEffect(() => {
    if (done) {
      cancel()
      onComplete({ ok, ng, ngByCategory: session.ngByCategory, ngIds: session.ngIds })
    }
  }, [done]) // eslint-disable-line

  if (done) return null

  const onReveal = () => {
    session.revealAnswer()
    if (deEnabled) setTimeout(() => speak(current.de, 'de'), 300)
  }

  const handleOk = () => {
    weakIds?.remove(current.id)
    session.advance('ok')
    addResult?.(true)
    prevWasWrong.current = false
  }

  const handleNg = () => {
    weakIds?.add(current.id)
    session.advance('ng')
    addResult?.(false)
    if (!prevWasWrong.current) showToast('Schade...', 'thinking')
    prevWasWrong.current = true
  }

  const total = sentences.length
  const rate  = ok + ng > 0 ? Math.round((ok / (ok + ng)) * 100) : 0

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>

      {/* ── Header Row 1: spacer | tabs | X ── */}
      <View style={styles.headerTop}>
        <View style={styles.headerSpacer} />
        {onModeChange && (
          <View style={[styles.modeToggle, { backgroundColor: t.tabBg }]}>
            {[{ id: 'card', label: 'カード' }, { id: 'input', label: '入力' }].map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                onPress={() => onModeChange(id)}
                style={[
                  styles.modeBtn,
                  mode === id ? { backgroundColor: t.solidBg } : { backgroundColor: 'transparent' },
                ]}
              >
                <Text style={[styles.modeBtnText, { color: mode === id ? t.solidText : t.textSub, fontFamily: mode === id ? Fonts.monoSemi : Fonts.monoReg }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => { cancel(); onExit() }} style={styles.exitBtn}>
            <X size={24} color={t.textSub} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── プログレスバー ── */}
      <View style={[styles.progressTrack, { backgroundColor: t.surface }]}>
        <View style={[
          styles.progressFill,
          { backgroundColor: t.solidBg, width: `${(ok + ng) / total * 100}%` }
        ]} />
      </View>

      {/* ── Sub-header: JP/DE + scores ── */}
      <View style={styles.subHeader}>
        {/* audio toggles (right-aligned) */}
        <View style={styles.audioRow}>
          <AudioToggle label="JP" enabled={jpEnabled} onToggle={toggleJp} theme={t} />
          <AudioToggle label="DE" enabled={deEnabled} onToggle={toggleDe} theme={t} />
        </View>
        {/* scores */}
        <View style={styles.scoreRow}>
          <ScoreCell label="正解"   value={ok}         color={t.text} subColor={t.textSub} />
          <ScoreCell label="不正解" value={ng}         color={t.text} subColor={t.textSub} />
          <ScoreCell label="正答率" value={`${rate}%`} color={t.text} subColor={t.textSub} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── バッジ + 問題番号 ── */}
        <View style={styles.badgeRow}>
          <Badge level={current.level} category={current.category} theme={t} />
          <Text style={[styles.qNum, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>
            {ok + ng + 1} / {total}
          </Text>
        </View>

        {/* ── カード ── */}
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: t.textSub, fontFamily: Fonts.monoSemi }]}>日本語</Text>
            {weakIds && (
              <TouchableOpacity
                onPress={() => weakIds.toggle(current.id)}
                style={styles.bookmarkBtn}
              >
                <Bookmark
                  size={18}
                  color={t.textSub}
                  strokeWidth={1.8}
                  fill={weakIds.isWeak(current.id) ? t.textSub : 'none'}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.jpText, { color: t.text, fontFamily: Fonts.barlowSemi }]}>{current.jp}</Text>

          {showHint && (
            <Text style={[styles.hint, { color: t.textSub, fontFamily: Fonts.barlowReg }]}>{current.hint}</Text>
          )}

          {!autoPlay.isPlaying && (
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => jpEnabled && speak(current.jp_yomi ?? current.jp, 'ja')}
              >
                <Volume2 size={18} color={t.textSub} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={session.toggleHint}
              >
                <Lightbulb
                  size={18}
                  color={t.textSub}
                  strokeWidth={2}
                  fill={showHint ? t.textSub : 'none'}
                />
              </TouchableOpacity>
            </View>
          )}

          {revealed && (
            <View style={[styles.deSection, { borderTopColor: t.border }]}>
              <Text style={[styles.cardLabel, { color: t.textSub, fontFamily: Fonts.monoSemi, marginBottom: 12 }]}>Deutsch</Text>
              <Text style={[styles.deText, { color: t.text, fontFamily: Fonts.barlowSemi }]}>{current.de}</Text>
              {!autoPlay.isPlaying && (
                <View style={styles.deAudioRow}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => deEnabled && speak(current.de, 'de')}
                  >
                    <Volume2 size={18} color={t.textSub} strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.slowBtn, { borderColor: t.border }]}
                    onPress={() => deEnabled && speak(current.de, 'de', undefined, 0.5)}
                  >
                    <Text style={[styles.slowBtnText, { color: t.textSub, fontFamily: Fonts.monoSemi }]}>Slow</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── カウントダウンバー ── */}
        {autoPlay.isPlaying && autoPlay.countdown > 0 && (
          <View style={[styles.countdownTrack, { backgroundColor: t.surface }]}>
            <View style={[
              styles.countdownFill,
              { backgroundColor: t.solidBg, width: `${autoPlay.countdown * 100}%` }
            ]} />
          </View>
        )}

        {/* ── コントロール ── */}
        {autoPlay.isPlaying ? (
          <TouchableOpacity
            style={[styles.revealBtn, { backgroundColor: t.surface, borderWidth: 2, borderColor: t.borderStrong }]}
            onPress={autoPlay.stop}
          >
            <Pause size={14} color={t.text} />
            <Text style={[styles.revealBtnText, { color: t.text, marginLeft: 8, fontFamily: Fonts.barlowSemi }]}>停止</Text>
          </TouchableOpacity>
        ) : !revealed ? (
          <>
            <TouchableOpacity
              style={[styles.revealBtn, { backgroundColor: t.solidBg }]}
              onPress={onReveal}
            >
              <Text style={[styles.revealBtnText, { color: t.solidText, fontFamily: Fonts.barlowSemi }]}>ドイツ語を見る</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: t.border, backgroundColor: t.bg, alignSelf: 'center' }]}
              onPress={autoPlay.start}
            >
              <Play size={13} color={t.text} />
              <Text style={[styles.secondaryBtnText, { color: t.text, marginLeft: 8, fontFamily: Fonts.barlowSemi }]}>自動再生</Text>
            </TouchableOpacity>

            <PauseStepper value={pauseDuration} onChange={setPauseDuration} theme={t} />

            <TouchableOpacity onPress={session.reset} style={styles.subBtnRow}>
              <RotateCcw size={12} color={t.textSub} />
              <Text style={[styles.subBtnText, { color: t.textSub, marginLeft: 5, fontFamily: Fonts.barlowReg }]}>最初から</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.rateButtons}>
              <TouchableOpacity
                style={[styles.rateBtn, { backgroundColor: t.bg, borderColor: t.border }]}
                onPress={handleNg}
              >
                <Text style={[styles.rateBtnText, { color: t.text, fontFamily: Fonts.barlowSemi }]}>わからなかった</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateBtn, { backgroundColor: t.solidBg, borderColor: t.solidBg }]}
                onPress={handleOk}
              >
                <Text style={[styles.rateBtnText, { color: t.solidText, fontFamily: Fonts.barlowSemi }]}>わかった</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={session.reset} style={[styles.subBtnRow, { marginTop: 12 }]}>
              <RotateCcw size={12} color={t.textSub} />
              <Text style={[styles.subBtnText, { color: t.textSub, marginLeft: 5, fontFamily: Fonts.barlowReg }]}>最初から</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

      {/* Toast notification — 吹き出し上・マスコット下（足は画面外） */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastWrap,
            {
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              }],
            },
          ]}
        >
          {/* 吹き出し */}
          <View style={[styles.toastBubble, { backgroundColor: t.surface }]}>
            <Text style={[styles.toastText, { color: t.text, fontFamily: Fonts.monoSemi }]}>
              {toast.msg}
            </Text>
            {/* 下向き三角テール */}
            <View style={[styles.toastTail, { borderTopColor: t.surface }]} />
          </View>
          {/* マスコット（足60pxは画面外にはみ出す） */}
          <RiveMascot size={160} scene={toast.variant === 'happy' ? 1 : 3} />
        </Animated.View>
      )}
    </View>
  )
}

/* ── Sub-components ── */

function ScoreCell({ label, value, color, subColor }) {
  return (
    <View style={styles.scoreCell}>
      <Text style={[styles.scoreValue, { color, fontFamily: Fonts.monoSemi }]}>{value}</Text>
      <Text style={[styles.scoreLabel, { color: subColor, fontFamily: Fonts.monoReg }]}>{label}</Text>
    </View>
  )
}

function Badge({ level, category, theme: t }) {
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.badgeText, { color: t.textSub, fontFamily: Fonts.monoReg }]}>
        {level} · {category}
      </Text>
    </View>
  )
}

function AudioToggle({ label, enabled, onToggle, theme: t }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.audioToggle,
        { backgroundColor: enabled ? t.solidBg : t.surface },
      ]}
    >
      {enabled
        ? <Volume2 size={12} strokeWidth={2} color={t.solidText} />
        : <VolumeX size={12} strokeWidth={2} color={t.textMuted} />
      }
      <Text style={[styles.audioToggleText, { color: enabled ? t.solidText : t.textMuted, fontFamily: Fonts.monoSemi }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function PauseStepper({ value, onChange, theme: t }) {
  return (
    <View style={styles.pauseStepper}>
      <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))} style={styles.pauseBtn}>
        <Text style={[styles.pauseBtnText, { color: t.textSub }]}>－</Text>
      </TouchableOpacity>
      <Text style={[styles.pauseValue, { color: t.textSub, fontFamily: Fonts.monoReg }]}>{value}s</Text>
      <TouchableOpacity onPress={() => onChange(Math.min(5, value + 1))} style={styles.pauseBtn}>
        <Text style={[styles.pauseBtnText, { color: t.textSub }]}>＋</Text>
      </TouchableOpacity>
    </View>
  )
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
  },
  subHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0, gap: 0,
  },
  headerSpacer: { flex: 1 },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  scoreRow: { flexDirection: 'row', gap: 40, justifyContent: 'center', paddingVertical: 16 },
  scoreCell: { alignItems: 'center' },
  scoreValue: { fontSize: 24, fontWeight: '600', letterSpacing: -0.4 },
  scoreLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
  audioRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  audioToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 50,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  audioToggleText: { fontSize: 10, letterSpacing: 0.54, textTransform: 'uppercase' },
  modeToggle: {
    flexDirection: 'row', borderRadius: 50, padding: 3, gap: 2,
  },
  modeBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 50 },
  modeBtnText: { fontSize: 11, lineHeight: 14, textTransform: 'uppercase', letterSpacing: 0.54 },
  exitBtn: { padding: 6 },
  progressTrack: { height: 5 },
  progressFill: { height: '100%' },
  scrollContent: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 12,
  },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  badge: {
    borderWidth: 1, borderRadius: 50,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  badgeText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  qNum: { fontSize: 11, letterSpacing: 0.3 },
  card: { borderRadius: 16, padding: 28 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  bookmarkBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: -9 },
  jpText: { fontSize: 26, fontWeight: '600', lineHeight: 38 },
  hint: { fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginLeft: -9, marginRight: -9 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  deSection: { marginTop: 24, paddingTop: 24, borderTopWidth: 1 },
  deText: { fontSize: 24, fontWeight: '600', lineHeight: 34 },
  deAudioRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 14, marginLeft: -9 },
  slowBtn: {
    borderWidth: 1, borderRadius: 50,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  slowBtnText: { fontSize: 10, letterSpacing: 0.54, textTransform: 'uppercase' },
  countdownTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  countdownFill: { height: '100%', borderRadius: 2 },
  revealBtn: {
    flexDirection: 'row', borderRadius: 50, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  revealBtnText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.54, textTransform: 'uppercase' },
  secondaryBtn: {
    flexDirection: 'row', borderWidth: 2, borderRadius: 50,
    paddingVertical: 10, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.54, textTransform: 'uppercase' },
  pauseStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  pauseBtn: { padding: 8 },
  pauseBtnText: { fontSize: 16 },
  pauseValue: { fontSize: 11, minWidth: 28, textAlign: 'center', letterSpacing: 0.3 },
  subBtnRow: { flexDirection: 'row', alignItems: 'center' },
  subBtnText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.54 },
  rateButtons: { flexDirection: 'row', gap: 10 },
  rateBtn: { flex: 1, paddingVertical: 14, borderRadius: 50, alignItems: 'center', borderWidth: 2 },
  rateBtnText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  toastWrap: {
    position: 'absolute', bottom: -60, alignSelf: 'center',
    flexDirection: 'column', alignItems: 'center',
    zIndex: 1000,
  },
  toastBubble: {
    borderRadius: 50,
    paddingVertical: 8, paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 5,
    position: 'relative',
  },
  toastTail: {
    position: 'absolute', bottom: -7, alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 6,  borderLeftColor:  'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 7,
  },
  toastText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.54 },
})
