const Footer = () => {
    return (
        <footer className="bg-zinc-800 border-t border-zinc-700 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Información principal */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                            <div className="text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Apolo POS</h3>
                        </div>
                        <p className="text-sm text-zinc-400 max-w-md">
                            Sistema integral de punto de venta y gestión de inventarios con inteligencia artificial
                        </p>
                    </div>

                    {/* Enlaces rápidos */}
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                        <div className="flex items-center space-x-4 text-sm text-zinc-400">
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Versión 1.0</span>
                            </span>
                            <span className="hidden md:block">•</span>
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span>{new Date().getFullYear()}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria */}
                <div className="border-t border-zinc-700 mt-6 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                        <div className="text-xs text-zinc-500 text-center md:text-left">
                            <p>&copy; {new Date().getFullYear()} Apolo POS. Todos los derechos reservados.</p>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-zinc-500">
                            <span className="flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Hecho con ❤️</span>
                            </span>
                            <span className="hidden md:block">•</span>
                            <span>Ingeniería de Software</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer