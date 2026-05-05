import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native'
import { Volume2, VolumeX, Lightbulb, X, RotateCcw } from 'lucide-react-native'
import { useSession } from '../hooks/useSession'
import { useTTS } from '../hooks/useTTS'
import { useAudioSettings } from '../hooks/useAudioSettings'
import { Fonts } from '../fonts'

const UMLAUTS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999', textMuted: '#ccc',
  solidBg: '#000', solidText: '#fff', tabBg: '#e8eaed',
}

export function InputScreen({ sentences, onComplete, onExit, addResult, theme, mode, onModeChange }) {
  const t = theme ?? defaultTheme
  const session = useSession(sentences)
  const { speak, speaking } = useTTS()
  const { jpEnabled, deEnabled, toggleJp, toggleDe } = useAudioSettings()

  const { current, ok, ng, done, checked, feedback, showHint } = session
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (current) {
      setInputValue('')
      if (jpEnabled) {
        const timer = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
        return () => clearTimeout(timer)
      }
    }
  }, [current?.id]) // eslint-disable-line

  useEffect(() => {
    if (checked) inputRef.current?.blur()
  }, [checked])

  useEffect(() => {
    if (done) onComplete({ ok, ng, ngByCategory: session.ngByCategory, ngIds: session.ngIds })
  }, [done]) // eslint-disable-line

  if (done) return null

  const handleSubmit = () => {
    const val = inputValue.trim()
    if (!val || checked) return
    const correct = session.submitInput(val)
    addResult?.(correct)
    if (deEnabled) setTimeout(() => speak(current.de, 'de'), 200)
  }

  const insertChar = (c) => {
    if (checked) return
    setInputValue(prev => prev + c)
    inputRef.current?.focus()
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
          <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
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

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── バッジ + 問題番号 ── */}
        <View style={styles.badgeRow}>
          <Badge level={current.level} category={current.category} theme={t} />
          <Text style={[styles.qNum, { color: t.textMuted, fontFamily: Fonts.monoReg }]}>
            {ok + ng + 1} / {total}
          </Text>
        </View>

        {/* ── カード ── */}
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Text style={[styles.cardLabel, { color: t.textSub, fontFamily: Fonts.monoSemi }]}>日本語</Text>
          <Text style={[styles.jpText, { color: t.text, fontFamily: Fonts.barlowSemi }]}>{current.jp}</Text>

          {showHint && (
            <Text style={[styles.hint, { color: t.textSub, fontFamily: Fonts.barlowReg }]}>{current.hint}</Text>
          )}

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
              <Lightbulb size={18} color={t.textSub} strokeWidth={2} fill={showHint ? t.textSub : 'none'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 入力エリア ── */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              editable={!checked}
              placeholder="ドイツ語で入力..."
              placeholderTextColor={t.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              returnKeyType="done"
              onSubmitEditing={checked ? () => session.advance(feedback) : handleSubmit}
              style={[
                styles.input,
                {
                  backgroundColor: t.bg,
                  borderColor: feedback ? t.borderStrong : t.border,
                  color: t.text,
                  fontFamily: Fonts.monoReg,
                }
              ]}
            />
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: t.solidBg, opacity: checked ? 0.3 : 1 }]}
              onPress={handleSubmit}
              disabled={checked}
            >
              <Text style={[styles.submitBtnText, { color: t.solidText, fontFamily: Fonts.barlowSemi }]}>確認</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.umlautRow}>
            {UMLAUTS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.umlautBtn, { backgroundColor: t.bg, borderColor: t.border }]}
                onPress={() => insertChar(c)}
              >
                <Text style={[styles.umlautBtnText, { color: t.text, fontFamily: Fonts.monoReg }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {feedback && (
            <View style={[styles.feedback, { backgroundColor: t.surface }]}>
              <Text style={[styles.feedbackLabel, { color: t.textSub, fontFamily: Fonts.monoSemi }]}>
                {feedback === 'ok' ? '正解' : '不正解'}
              </Text>
              <Text style={[styles.feedbackDe, { color: t.text, fontFamily: Fonts.barlowSemi }]}>{current.de}</Text>
              {feedback === 'ng' && (
                <Text style={[styles.feedbackAnswer, { color: t.textSub, fontFamily: Fonts.barlowReg }]}>
                  あなたの答え: {inputValue}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.iconBtn, { marginTop: 14 }]}
                onPress={() => deEnabled && speak(current.de, 'de')}
              >
                <Volume2 size={18} color={t.textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── ナビ ── */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={session.reset} style={styles.subBtnRow}>
            <RotateCcw size={12} color={t.textSub} />
            <Text style={[styles.subBtnText, { color: t.textSub, marginLeft: 5, fontFamily: Fonts.barlowReg }]}>最初から</Text>
          </TouchableOpacity>
          {checked && (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: t.solidBg }]}
              onPress={() => session.advance(feedback)}
            >
              <Text style={[styles.nextBtnText, { color: t.solidText, fontFamily: Fonts.barlowSemi }]}>次へ →</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  )
}

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
      style={[styles.audioToggle, { backgroundColor: enabled ? t.solidBg : t.surface }]}
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
    borderRadius: 50, paddingVertical: 3, paddingHorizontal: 10,
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderWidth: 1, borderRadius: 50, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  qNum: { fontSize: 11, letterSpacing: 0.3 },
  card: { borderRadius: 16, padding: 28 },
  cardLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  jpText: { fontSize: 26, fontWeight: '600', lineHeight: 38 },
  hint: { fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginLeft: -9, marginRight: -9 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  inputArea: { gap: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 2, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  submitBtn: { borderRadius: 50, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
  submitBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.54 },
  umlautRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  umlautBtn: { borderWidth: 2, borderRadius: 50, paddingVertical: 4, paddingHorizontal: 12 },
  umlautBtnText: { fontSize: 13 },
  feedback: { borderRadius: 16, padding: 20 },
  feedbackLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  feedbackDe: { fontSize: 24, fontWeight: '600', lineHeight: 34 },
  feedbackAnswer: { fontSize: 12, marginTop: 6 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  subBtnRow: { flexDirection: 'row', alignItems: 'center' },
  subBtnText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.54 },
  nextBtn: { borderRadius: 50, paddingVertical: 10, paddingHorizontal: 28 },
  nextBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.54 },
})
