import { useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  const [screen, setScreen] = useState('title') // 'title' | 'study' | 'input' | 'completion'
  const [sessionSentences, setSessionSentences] = useState([])
  const [result, setResult] = useState(null)
  const [themeId, setThemeId] = useState(defaultThemeId)
  const [mode, setMode] = useState('card') // 'card' | 'input'

  const weakIds = useWeakIds()
  const { record, addResult } = useStudyRecord()

  const theme = themes[themeId] ?? themes[defaultThemeId]

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

  return (
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
          mode={mode}
          onModeChange={handleModeChange}
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
        />
      )}
      {screen === 'input' && (
        <InputScreen
          sentences={sessionSentences}
          onComplete={handleComplete}
          onExit={handleExit}
          addResult={addResult}
          theme={theme}
        />
      )}
      {screen === 'completion' && result && (
        <CompletionScreen
          ok={result.ok}
          ng={result.ng}
          onHome={handleExit}
          onRetry={handleRetry}
          theme={theme}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
