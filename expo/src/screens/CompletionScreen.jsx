import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Mascot } from '../components/Mascot'

export function CompletionScreen({ ok, ng, onHome, onRetry, theme }) {
  const t = theme ?? defaultTheme
  const total = ok + ng
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Mascot size={100} variant="happy-no-mouth" animation="bounce" />
      <Text style={[styles.title, { color: t.text }]}>Fertig!</Text>
      <Text style={[styles.rate, { color: t.text }]}>{rate}%</Text>
      <Text style={[styles.sub, { color: t.textSub }]}>{ok} / {total} 正解</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.solidBtn, { backgroundColor: t.solidBg }]}
          onPress={onRetry}
        >
          <Text style={[styles.solidBtnText, { color: t.solidText }]}>もう一度</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ghostBtn, { borderColor: t.border }]}
          onPress={onHome}
        >
          <Text style={[styles.ghostBtnText, { color: t.text }]}>トップへ戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const defaultTheme = {
  bg: '#fff', border: '#e0e0e0',
  text: '#000', textSub: '#999',
  solidBg: '#000', solidText: '#fff',
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingHorizontal: 32,
  },
  title: { fontSize: 40, fontWeight: '800' },
  rate: { fontSize: 64, fontWeight: '700', letterSpacing: -2 },
  sub: { fontSize: 14 },
  buttonGroup: { width: '100%', gap: 10, marginTop: 16 },
  solidBtn: {
    borderRadius: 50, paddingVertical: 15, alignItems: 'center',
  },
  solidBtnText: {
    fontSize: 13, fontWeight: '600',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
  ghostBtn: {
    borderWidth: 2, borderRadius: 50,
    paddingVertical: 13, alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 13, fontWeight: '400',
    letterSpacing: 0.54, textTransform: 'uppercase',
  },
})
