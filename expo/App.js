import { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono'
import {
  Barlow_400Regular,
  Barlow_600SemiBold,
} from '@expo-google-fonts/barlow'
import { PaytoneOne_400Regular } from '@expo-google-fonts/paytone-one'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Rive, { Fit } from 'rive-react-native'
import { Fonts } from './src/fonts'
import { TitleScreen } from './src/screens/TitleScreen'
import { StudyScreen } from './src/screens/StudyScreen'
import { InputScreen } from './src/screens/InputScreen'
import { CompletionScreen } from './src/screens/CompletionScreen'
import { useWeakIds } from './src/hooks/useWeakIds'
import { useStudyRecord } from './src/hooks/useStudyRecord'
import { themes, defaultThemeId } from './src/themes'

const THEME_KEY = 'pommes-theme'
const MODE_KEY  = 'pommes-mode'

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
    Barlow_400Regular,
    Barlow_600SemiBold,
    PaytoneOne_400Regular,
  })

  const [screen, setScreen] = useState('title')
  const [splashDone, setSplashDone] = useState(false)
  const [waveCompleted, setWaveCompleted] = useState(false)
  const [sessionSentences, setSessionSentences] = useState([])
  const [result, setResult] = useState(null)
  const [themeId, setThemeId] = useState(defaultThemeId)
  const [mode, setMode] = useState('card')

  const weakIds = useWeakIds()
  const { record, addResult } = useStudyRecord()

  const theme = themes[themeId] ?? themes[defaultThemeId]

  // フォントロード AND arms_wave 完了 → タイトルへ
  useEffect(() => {
    if (fontsLoaded && waveCompleted) setSplashDone(true)
  }, [fontsLoaded, waveCompleted])

  // フォールバック: 最大 4 秒（arms_wave が Loop 設定の場合の保険）
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 4000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val && themes[val]) setThemeId(val)
    })
    AsyncStorage.getItem(MODE_KEY).then(val => {
      if (val === 'card' || val === 'input') setMode(val)
    })
  }, [])

  const handleThemeChange = (id) => {
    setThemeId(id)
    AsyncStorage.setItem(THEME_KEY, id)
  }

  const handleModeChange = (m) => {
    setMode(m)
    AsyncStorage.setItem(MODE_KEY, m)
  }

  const handleStart = (filtered) => {
    setSessionSentences(filtered)
    setScreen(mode === 'input' ? 'input' : 'study')
  }

  const handleComplete = (res) => {
    setResult(res)
    res.ngIds.forEach(id => weakIds.add(id))
    setScreen('completion')
  }

  const handleExit = () => setScreen('title')

  const handleRetry = () => {
    setResult(null)
    setScreen(mode === 'input' ? 'input' : 'study')
  }

  const handleRetryWrong = (wrongSentences) => {
    setSessionSentences(wrongSentences)
    setResult(null)
    setScreen(mode === 'input' ? 'input' : 'study')
  }

  // フォントロード中 or スプラッシュ表示中はスプラッシュを表示
  if (!fontsLoaded || !splashDone) {
    return <PommesSplash fontsLoaded={fontsLoaded} onWaveComplete={() => setWaveCompleted(true)} />
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style="dark" />
      {screen === 'title' && (
        <TitleScreen
          onStart={handleStart}
          weakIds={weakIds}
          studyRecord={record}
          theme={theme}
          themes={themes}
          onThemeChange={handleThemeChange}
        />
      )}
      {screen === 'study' && (
        <StudyScreen
          sentences={sessionSentences}
          onComplete={handleComplete}
          onExit={handleExit}
          addResult={addResult}
          theme={theme}
          weakIds={weakIds}
          mode={mode}
          onModeChange={(m) => { handleModeChange(m); setScreen(m === 'input' ? 'input' : 'study') }}
        />
      )}
      {screen === 'input' && (
        <InputScreen
          sentences={sessionSentences}
          onComplete={handleComplete}
          onExit={handleExit}
          addResult={addResult}
          theme={theme}
          mode={mode}
          onModeChange={(m) => { handleModeChange(m); setScreen(m === 'input' ? 'input' : 'study') }}
        />
      )}
      {screen === 'completion' && result && (
        <CompletionScreen
          ok={result.ok}
          ng={result.ng}
          ngIds={result.ngIds}
          sentences={sessionSentences}
          onHome={handleExit}
          onRetry={handleRetry}
          onRetryWrong={handleRetryWrong}
          theme={theme}
        />
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  )
}

const RIVE_URL = 'https://kiskejp.github.io/pommes/pommes.riv'

function PommesSplash({ fontsLoaded, onWaveComplete }) {
  const calledRef = useRef(false)

  function handleWaveEnd(animName) {
    if (animName === 'arms_wave' && !calledRef.current) {
      calledRef.current = true
      onWaveComplete()
    }
  }

  return (
    <View style={splash.container}>
      <StatusBar style="dark" />
      {/* 下余白をクリップしてロゴとの間隔を詰める */}
      <View style={{ width: 180, height: 172, overflow: 'hidden', alignItems: 'center' }}>
        <Rive
          url={RIVE_URL}
          animationName="arms_wave"
          autoplay={true}
          fit={Fit.Contain}
          style={{ width: 180, height: 180 }}
          onStop={handleWaveEnd}
          onLoopEnd={handleWaveEnd}
        />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={[splash.logo, fontsLoaded && { fontFamily: Fonts.paytone }]}>Pommes</Text>
        <Text style={[splash.sub, fontsLoaded && { fontFamily: Fonts.monoReg }]}>瞬間ドイツ語作文</Text>
      </View>
    </View>
  )
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logo: {
    fontSize: 46,
    color: '#44403c',
    letterSpacing: -1,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#44403c',
    letterSpacing: 2,
    opacity: 0.5,
    marginTop: 10,
    textAlign: 'center',
  },
})

const styles = StyleSheet.create({
  root: { flex: 1 },
})
