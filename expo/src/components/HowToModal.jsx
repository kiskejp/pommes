// components/HowToModal.jsx
import { useEffect, useRef } from 'react'
import {
  Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ScrollView, Animated,
} from 'react-native'
import { X, Eye, Keyboard, Zap } from 'lucide-react-native'
import { Fonts } from '../fonts'

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

export function HowToModal({ visible, onClose, theme: t }) {
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY,  { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      sheetTranslateY.setValue(300)
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* 背景：フェードイン */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* シート：スライドアップ */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: t.bg, transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text, fontFamily: Fonts.paytone }]}>
            使い方
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: t.surface }]}
          >
            <X size={16} strokeWidth={2} color={t.textSub} />
          </TouchableOpacity>
        </View>

        {/* ステップ */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.steps}>
            {STEPS.map(({ icon: Icon, title, desc }) => (
              <View key={title} style={styles.step}>
                <View style={[styles.iconBadge, { backgroundColor: t.surface }]}>
                  <Icon size={18} strokeWidth={2} color={t.text} />
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, { color: t.text, fontFamily: Fonts.monoSemi }]}>
                    {title}
                  </Text>
                  <Text style={[styles.stepDesc, { color: t.textSub, fontFamily: Fonts.barlowReg }]}>
                    {desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  steps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBadge: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
})
