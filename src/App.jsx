import { Routes, Route } from 'react-router-dom'
import { TransactionProvider } from '@/store/TransactionContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Reports from '@/pages/Reports'
import Categories from '@/pages/Categories'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'

function App() {
  return (
    <TransactionProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </TransactionProvider>
  )
}

export default App
