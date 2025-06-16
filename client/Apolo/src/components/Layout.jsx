import { Outlet } from 'react-router'
import Navbar from './NavBar'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
    const { isAuthenticated } = useAuth()

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            {/* Solo mostrar el chat si el usuario está autenticado */}
            {isAuthenticated() && <ChatWidget />}
        </div>
    )
}

export default Layout