import './application/common/styles/main.scss'
import { useTheme } from './application/common/utils/context/ThemeContext'

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      <h1>Чистый проект: Vite + React + TS + SCSS</h1>
      <p>Текущая тема: <strong>{theme}</strong></p>
      <button className="theme-btn" onClick={toggleTheme}>
        Переключить на {theme === 'light' ? 'тёмную' : 'светлую'} тему
      </button>
    </div>
  )
}

export default App
