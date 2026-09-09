import './application/styles/main.scss'
import { AppProvider } from './application/state/appStore'
import { AppShell } from './application/AppShell'

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

export default App
