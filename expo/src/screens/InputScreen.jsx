import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native'
import { useSession } from '../hooks/useSession'
import { useTTS } from '../hooks/useTTS'

const UMLAUTS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999', textMuted: '#ccc',
  solidBg: '#000', solidText: '#fff',
}

export function InputScreen({ sentences, onComplete, onExit, addResult, theme }) {
  const t = theme ?? defaultTheme
  const session = useSession(sentences)
  const { speak, speaking } = useTTS()

  const { current, ok, ng, done, checked, feedback, showHint } = session
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  // JP読み上げ（カード切り替え時）
  useEffect(() => {
    if (current) {
      setInputValue('')
      const timer = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(timer)
    }
  }, [current?.id]) // eslint-disable-line

  // 採点後はフォーカスを外す
  useEffect(() => {
    if (checked) inputRef.current?.blur()
  }, [checked])

  // 完了
  useEffect(() => {
    if (done) onComplete({ ok, ng, ngByCategory: session.ngByCategory, ngIds: session.ngIds })
  }, [done]) // eslint-disable-line

  if (done) return null

  const handleSubmit = () => {
    const val = inputValue.trim()
    if (!val || checked) return
    const correct = session.submitInput(val)
    addResult?.(correct)
    setTimeout(() => speak(current.de, 'de'), 200)
  }

  const insertChar = (c) => {
    if (checked) return
    const next = inputValue + c
    setInputValue(next)
    inputRef.current?.focus()
  }

  const total = sentences.length
  const rate  = ok + ng > 0 ? Math.round((ok / (ok + ng)) * 100) : 0

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.scoreRow}>
          <ScoreCell label="正解"   value={ok}        color={t.text} subColor={t.textSub} />
          <ScoreCell label="不正解" value={ng}        color={t.text} subColor={t.textSub} />
          <ScoreCell label="正答率" value={`${rate}%`} color={t.text} subColor={t.textSub} />
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={[styles.exitBtnText, { color: t.textSub }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* ── プログレスバー ── */}
      <View style={[styles.progressTrack, { backgroundColor: t.surface }]}>
        <View style={[
          styles.progressFill,
          { backgroundColor: t.solidBg, width: `${(ok + ng) / total * 100}%` }
        ]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── バッジ + 問題番号 ── */}
        <View style={styles.badgeRow}>
          <View style={styles.badges}>
            <Badge label={current.level}    theme={t} />
            <Badge label={current.category} theme={t} />
          </View>
          <Text style={[styles.qNum, { color: t.textMuted }]}>
            {ok + ng + 1} / {total}
          </Text>
        </View>

        {/* ── カード ── */}
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <Text style={[styles.cardLabel, { color: t.textSub }]}>日本語</Text>
          <Text style={[styles.jpText, { color: t.text }]}>{current.jp}</Text>

          {showHint && (
            <Text style={[styles.hint, { color: t.textSub }]}>{current.hint}</Text>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: t.bg }]}
              onPress={() => speak(current.jp_yomi ?? current.jp, 'ja')}
            >
              <Text style={styles.iconBtnText}>🔊</Text>
              <Text style={[styles.iconBtnLabel, { color: t.textSub }]}>音声を聞く</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: t.bg }]}
              onPress={session.toggleHint}
            >
              <Text style={styles.iconBtnText}>💡</Text>
              <Text style={[styles.iconBtnLabel, { color: showHint ? t.text : t.textSub }]}>
                {showHint ? 'ヒントを隠す' : 'ヒント'}
              </Text>
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
                }
              ]}
            />
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: t.solidBg, opacity: checked ? 0.3 : 1 }]}
              onPress={handleSubmit}
              disabled={checked}
            >
              <Text style={[styles.submitBtnText, { color: t.solidText }]}>確認</Text>
            </TouchableOpacity>
          </View>

          {/* ウムラウトキー */}
          <View style={styles.umlautRow}>
            {UMLAUTS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.umlautBtn, { backgroundColor: t.bg, borderColor: t.border }]}
                onPress={() => insertChar(c)}
              >
                <Text style={[styles.umlautBtnText, { color: t.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* フィードバック */}
          {feedback && (
            <View style={[styles.feedback, { backgroundColor: t.surface }]}>
              <Text style={[styles.feedbackLabel, { color: t.textSub }]}>
                {feedback === 'ok' ? '正解' : '不正解'}
              </Text>
              <Text style={[styles.feedbackDe, { color: t.text }]}>{current.de}</Text>
              {feedback === 'ng' && (
                <Text style={[styles.feedbackAnswer, { color: t.textSub }]}>
                  あなたの答え: {inputValue}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: t.bg, marginTop: 10 }]}
                onPress={() => speak(current.de, 'de')}
              >
                <Text style={styles.iconBtnText}>{speaking ? '…' : '🔊'}</Text>
                <Text style={[styles.iconBtnLabel, { color: t.textSub }]}>発音を聞く</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── ナビ ── */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={session.reset}>
            <Text style={[styles.subBtnText, { color: t.textSub }]}>↺ 最初から</Text>
          </TouchableOpacity>
          {checked && (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: t.solidBg }]}
              onPress={() => session.advance(feedback)}
            >
              <Text style={[styles.nextBtnText, { color: t.solidText }]}>次へ →</Text>
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
      <Text style={[styles.scoreValue, { color }]}>{value}</Text>
      <Text style={[styles.scoreLabel, { color: subColor }]}>{label}</Text>
    </View>
  )
}

function Badge({ label, theme: t }) {
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.badgeText, { color: t.textSub }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  scoreRow: { flex: 1, flexDirection: 'row', gap: 20 },
  scoreCell: { alignItems: 'center' },
  scoreValue: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  scoreLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
  exitBtn: { padding: 8 },
  exitBtnText: { fontSize: 18 },
  progressTrack: { height: 3 },
  progressFill: { height: '100%' },
  scrollContent: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 12,
  },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    borderWidth: 1, borderRadius: 50,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  badgeText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  qNum: { fontSize: 11, letterSpacing: 0.3 },
  card: { borderRadius: 16, padding: 28 },
  cardLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  jpText: { fontSize: 26, fontWeight: '600', lineHeight: 38 },
  hint: { fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 50 },
  iconBtnText: { fontSize: 14 },
  iconBtnLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputArea: { gap: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 2, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 16,
    fontSize: 16, letterSpacing: -0.14,
  },
  submitBtn: { borderRadius: 50, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
  submitBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.54 },
  umlautRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  umlautBtn: { borderWidth: 2, borderRadius: 50, paddingVertical: 4, paddingHorizontal: 12 },
  umlautBtnText: { fontSize: 13 },
  feedback: { borderRadius: 16, padding: 20 },
  feedbackLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  feedbackDe: { fontSize: 20, fontWeight: '600', letterSpacing: -0.26 },
  feedbackAnswer: { fontSize: 12, marginTop: 6, letterSpacing: -0.14 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subBtnText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.54 },
  nextBtn: { borderRadius: 50, paddingVertical: 10, paddingHorizontal: 28 },
  nextBtnText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.54 },
})
