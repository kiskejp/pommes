import { View, Text, StyleSheet } from 'react-native'

export function ScoreBar({ ok, ng, total, theme }) {
  const t = theme ?? { solidBg: '#000', surface: '#f0f0f0', text: '#000', textSub: '#999' }
  const answered = ok + ng
  const progress = total > 0 ? (answered / total) * 100 : 0

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: t.surface }]}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: t.solidBg }]} />
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: t.textSub }]}>{answered} / {total}</Text>
        <Text style={[styles.label, { color: t.text }]}>○ {ok}</Text>
        <Text style={[styles.label, { color: t.textSub }]}>✕ {ng}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 12 },
  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  labels: { flexDirection: 'row', marginTop: 6, gap: 12 },
  label: { fontFamily: 'monospace', fontSize: 11 },
})
