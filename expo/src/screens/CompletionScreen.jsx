import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { RotateCcw } from 'lucide-react-native'
import { RiveMascot } from '../components/RiveMascot'
import { Fonts } from '../fonts'

export function CompletionScreen({ ok, ng, ngIds, sentences, onHome, onRetry, onRetryWrong, theme }) {
  const t = theme ?? defaultTheme
  const total = ok + ng
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0

  // Dynamic message based on score
  const msg = rate === 100
    ? 'Perfekt! 完璧です。'
    : rate >= 70
    ? 'Gut gemacht. よくできました。'
    : 'Nochmal. もう一度。'

  // scene: 1=jump(高スコア), 0=idle(中スコア), 3=bad(低スコア)
  const mascotScene = rate >= 80 ? 1 : rate >= 50 ? 0 : 3

  // Wrong sentences
  const wrongSentences = sentences && ngIds
    ? sentences.filter(s => ngIds.includes(s.id))
    : []
  const visibleList = wrongSentences.slice(0, 5)
  const hiddenCount = wrongSentences.length - visibleList.length

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: t.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Mascot with speech bubble */}
      <View style={styles.mascotWrapper}>
        <View style={[styles.speechBubble, { backgroundColor: t.surface }]}>
          <Text style={[styles.speechText, { color: t.text, fontFamily: Fonts.monoSemi }]}>{msg}</Text>
          <View style={[styles.speechTail, { borderTopColor: t.surface }]} />
        </View>
        <RiveMascot size={160} scene={mascotScene} />
      </View>

      <Text style={[styles.title, { color: t.text, fontFamily: Fonts.serif }]}>Fertig.</Text>
      <Text style={[styles.rate, { color: t.text, fontFamily: Fonts.monoSemi }]}>{rate}%</Text>
      <Text style={[styles.sub, { color: t.textSub, fontFamily: Fonts.monoReg }]}>{ok} / {total} 正解</Text>

      {/* わからなかった問題一覧 */}
      {wrongSentences.length > 0 && (
        <View style={styles.wrongList}>
          <Text style={[styles.wrongListLabel, { color: t.textSub, fontFamily: Fonts.monoReg }]}>
            わからなかった問題 {wrongSentences.length}件
          </Text>
          <View style={[styles.wrongListBox, { borderColor: t.border }]}>
            {visibleList.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.wrongListItem,
                  { borderBottomColor: t.border },
                  i === visibleList.length - 1 && hiddenCount === 0 && styles.wrongListItemLast,
                ]}
              >
                <Text style={[styles.wrongListText, { color: t.text, fontFamily: Fonts.barlowReg }]}>
                  {s.jp}
                </Text>
              </View>
            ))}
            {hiddenCount > 0 && (
              <View style={styles.wrongListItemLast}>
                <Text style={[styles.wrongListMore, { color: t.textSub, fontFamily: Fonts.monoReg }]}>
                  他 {hiddenCount} 問
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.buttonGroup}>
        {wrongSentences.length > 0 && (
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: t.borderStrong }]}
            onPress={() => onRetryWrong(wrongSentences)}
          >
            <RotateCcw size={12} color={t.text} strokeWidth={2} />
            <Text style={[styles.ghostBtnText, { color: t.text, fontFamily: Fonts.barlowSemi }]}>
              わからなかった問題をもう一度
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.solidBtn, { backgroundColor: t.solidBg }]}
          onPress={onRetry}
        >
          <RotateCcw size={12} color={t.solidText} strokeWidth={2} />
          <Text style={[styles.solidBtnText, { color: t.solidText, fontFamily: Fonts.barlowSemi }]}>もう一度</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ghostBtn, { borderColor: t.border }]}
          onPress={onHome}
        >
          <Text style={[styles.ghostBtnText, { color: t.text, fontFamily: Fonts.barlowReg }]}>トップへ戻る</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const defaultTheme = {
  bg: '#fff', surface: '#f8f8f8', border: '#e0e0e0', borderStrong: '#000',
  text: '#000', textSub: '#999',
  solidBg: '#000', solidText: '#fff',
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingHorizontal: 32, paddingVertical: 48,
  },
  mascotWrapper: {
    alignItems: 'center',
  },
  speechBubble: {
    paddingVertical: 7, paddingHorizontal: 16,
    borderRadius: 50, marginBottom: 18,
    position: 'relative',
  },
  speechText: {
    fontSize: 13, fontWeight: '600',
  },
  speechTail: {
    position: 'absolute', bottom: -7, alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 6, borderLeftColor: 'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 7,
  },
  title: { fontSize: 48, fontWeight: '800', fontStyle: 'italic', letterSpacing: -1.5 },
  rate: { fontSize: 64, fontWeight: '700', letterSpacing: -2 },
  sub: { fontSize: 14 },
  wrongList: { width: '100%' },
  wrongListLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.54, marginBottom: 8,
  },
  wrongListBox: {
    borderWidth: 1, borderRadius: 12, overflow: 'hidden',
  },
  wrongListItem: {
    paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  wrongListItemLast: {
    paddingVertical: 10, paddingHorizontal: 16,
  },
  wrongListText: { fontSize: 14 },
  wrongListMore: { fontSize: 11 },
  buttonGroup: { width: '100%', gap: 10 },
  solidBtn: {
    flexDirection: 'row', gap: 8,
    borderRadius: 50, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  solidBtnText: {
    fontSize: 13, fontWeight: '600',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  ghostBtn: {
    flexDirection: 'row', gap: 8,
    borderWidth: 2, borderRadius: 50,
    paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: {
    fontSize: 13, fontWeight: '400',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
})
