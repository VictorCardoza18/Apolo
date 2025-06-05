const Footer = () => {
    return (
        <footer className="bg-secondary-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-lg font-semibold">Apolo POS</p>
                        <p className="text-sm text-gray-300">Sistema de punto de venta y gestión de inventarios</p>
                    </div>
                    <div className="text-sm text-gray-300">
                        <p>&copy; {new Date().getFullYear()} Apolo POS. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer