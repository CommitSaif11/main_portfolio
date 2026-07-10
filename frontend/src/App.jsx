import { Navigate, Route, Routes } from 'react-router-dom'
import { useMode } from './context/ModeContext'
import Entry from './pages/Entry'
import Layout from './components/Layout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import FitCheck from './pages/FitCheck'
import Contact from './pages/Contact'
import Play from './pages/Play'

function RequireMode({ children }) {
  const { mode } = useMode()
  if (!mode) {
    return <Entry />
  }
  return children
}

function App() {
  return (
    <RequireMode>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/fit-check" element={<FitCheck />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/play" element={<Play />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </RequireMode>
  )
}

export default App
