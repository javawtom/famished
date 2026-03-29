import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import FuelPage from './pages/FuelPage'
import ListPage from './pages/ListPage'
import RecipesPage from './pages/RecipesPage'
import ProgressPage from './pages/ProgressPage'
import LibraryPage from './pages/LibraryPage'
import TestLibraryPage from './pages/TestLibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<FuelPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/test-library" element={<TestLibraryPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
