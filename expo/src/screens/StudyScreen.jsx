import React, { useEffect, useCallback, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native'
import { useSession } from '../hooks/useSession'
import { useTTS } from '../hooks/useTTS'
import { useAutoPlay } from '../hooks/useAutoPlay'

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999', textMuted: '#ccc',
  solidBg: '#000', solidText: '#fff',
}

export function StudyScreen({ sentences, onComplete, onExit, addResult, theme, weakIds }) {
  const t = theme ?? defaultTheme
  const session = useSession(sentences)
  const { speak, speaking, cancel } = useTTS()
  const [pauseDuration, setPauseDuration] = useState(2)

  const { current, ok, ng, done, revealed, showHint, checked, feedback } = session

  const smartSpeak = useCallback((text, lang, onEnd) => {
    speak(text, lang, onEnd)
  }, [speak])

  const autoPlay = useAutoPlay({ session, speak: smartSpeak, pauseDuration })

  // JP読み上げ（カード切り替え時）
  useEffect(() => {
    if (current && !autoPlay.isPlaying) {
      const t2 = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(t2)
    }
  }, [current?.id]) // eslint-disable-line

  // セッション完了
  useEffect(() => {
    if (done) {
      cancel()
      onComplete({ ok, ng, ngByCategory: session.ngByCategory, ngIds: session.ngIds })
    }
  }, [done]) // eslint-disable-line

  if (done) return null

  const onReveal = () => {
    session.revealAnswer()
    setTimeout(() => speak(current.de, 'de'), 300)
  }

  const handleOk = () => {
    weakIds?.remove(current.id)
    session.advance('ok')
    addResult?.(true)
  }

  const handleNg = () => {
    weakIds?.add(current.id)
    session.advance('ng')
    addResult?.(false)
  }

  const total = sentences.length
  const rate  = ok + ng > 0 ? Math.round((ok / (ok + ng)) * 100) : 0

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>

      {/* ── Header: スコア3列 + 閉じる ── */}
      <View style={styles.header}>
        <View style={styles.scoreRow}>
          <ScoreCell label="正解" value={ok}    color={t.text} subColor={t.textSub} />
          <ScoreCell label="不正解" value={ng}  color={t.text} subColor={t.textSub} />
          <ScoreCell label="正答率" value={`${rate}%`} color={t.text} subColor={t.textSub} />
        </View>
        <TouchableOpacity onPress={() => { cancel(); onExit() }} style={styles.exitBtn}>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── バッジ + 問題番号 ── */}
        <View style={styles.badgeRow}>
          <View style={styles.badges}>
            <Badge label={current.level} theme={t} />
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

          {/* 音声 + ヒント ボタン行 */}
          {!autoPlay.isPlaying && (
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: t.bg }]}
                onPress={() => speak(current.jp_yomi ?? current.jp, 'ja')}
              >
                <Text style={styles.iconBtnText}>🔊</Text>
                <Text style={[styles.iconBtnLabel, { color: t.textSub }]}>音声</Text>
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
          )}

          {/* ── ドイツ語回答 ── */}
          {revealed && (
            <View style={[styles.deSection, { borderTopColor: t.border }]}>
              <Text style={[styles.cardLabel, { color: t.textSub }]}>Deutsch</Text>
              <Text style={[styles.deText, { color: t.text }]}>{current.de}</Text>
              {!autoPlay.isPlaying && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: t.bg, marginTop: 12 }]}
                  onPress={() => speak(current.de, 'de')}
                >
                  <Text style={styles.iconBtnText}>{speaking ? '…' : '🔊'}</Text>
                  <Text style={[styles.iconBtnLabel, { color: t.textSub }]}>Anhören</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── カウントダウンバー（自動再生中）── */}
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
            <Text style={[styles.revealBtnText, { color: t.text }]}>⏸ 停止</Text>
          </TouchableOpacity>
        ) : !revealed ? (
          <>
            <TouchableOpacity
              style={[styles.revealBtn, { backgroundColor: t.solidBg }]}
              onPress={onReveal}
            >
              <Text style={[styles.revealBtnText, { color: t.solidText }]}>ドイツ語を見る</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: t.border, backgroundColor: t.bg }]}
              onPress={autoPlay.start}
            >
              <Text style={[styles.secondaryBtnText, { color: t.text }]}>▶ 自動再生</Text>
            </TouchableOpacity>

            <PauseStepper value={pauseDuration} onChange={setPauseDuration} theme={t} />

            <TouchableOpacity onPress={session.reset} style={styles.subBtnRow}>
              <Text style={[styles.subBtnText, { color: t.textSub }]}>↺ 最初から</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.rateButtons}>
              <TouchableOpacity
                style={[styles.rateBtn, { backgroundColor: t.bg, borderColor: t.borderStrong }]}
                onPress={handleNg}
              >
                <Text style={[styles.rateBtnText, { color: t.text }]}>わからなかった</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateBtn, { backgroundColor: t.solidBg, borderColor: t.solidBg }]}
                onPress={handleOk}
              >
                <Text style={[styles.rateBtnText, { color: t.solidText }]}>わかった</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={session.reset} style={styles.subBtnRow}>
              <Text style={[styles.subBtnText, { color: t.textSub }]}>↺ 最初から</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  )
}

/* ── Sub-components ── */

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

function PauseStepper({ value, onChange, theme: t }) {
  return (
    <View style={styles.pauseStepper}>
      <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))} style={styles.pauseBtn}>
        <Text style={[styles.pauseBtnText, { color: t.textSub }]}>－</Text>
      </TouchableOpacity>
      <Text style={[styles.pauseValue, { color: t.textSub }]}>{value}s</Text>
      <TouchableOpacity onPress={() => onChange(Math.min(5, value + 1))} style={styles.pauseBtn}>
        <Text style={[styles.pauseBtnText, { color: t.textSub }]}>＋</Text>
      </TouchableOpacity>
    </View>
  )
}

/* ── Styles ── */
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
  progressTrack: { height: 3, marginHorizontal: 0 },
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
  card: {
    borderRadius: 16, padding: 28,
  },
  cardLabel: {
    fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
  },
  jpText: { fontSize: 26, fontWeight: '600', lineHeight: 38 },
  hint: { fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 16,
  },
  iconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 50,
  },
  iconBtnText: { fontSize: 14 },
  iconBtnLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  deSection: { marginTop: 24, paddingTop: 24, borderTopWidth: 1 },
  deText: { fontSize: 24, fontWeight: '600', lineHeight: 34 },
  countdownTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  countdownFill: { height: '100%', borderRadius: 2 },
  revealBtn: {
    borderRadius: 50, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  revealBtnText: {
    fontSize: 13, fontWeight: '600',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  secondaryBtn: {
    borderWidth: 2, borderRadius: 50,
    paddingVertical: 13, alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 12, fontWeight: '600',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  pauseStepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  pauseBtn: { padding: 8 },
  pauseBtnText: { fontSize: 16 },
  pauseValue: { fontSize: 11, minWidth: 28, textAlign: 'center', letterSpacing: 0.3 },
  subBtnRow: { alignItems: 'flex-start' },
  subBtnText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.54 },
  rateButtons: { flexDirection: 'row', gap: 10 },
  rateBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 50,
    alignItems: 'center', borderWidth: 2,
  },
  rateBtnText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
})

