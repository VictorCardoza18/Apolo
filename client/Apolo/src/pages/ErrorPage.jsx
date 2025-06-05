import { useRouteError, Link } from 'react-router'

const ErrorPage = () => {
    const error = useRouteError()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary-600">404</h1>
                <h2 className="text-3xl font-semibold mt-4 mb-2">¡Oops!</h2>
                <p className="text-lg text-gray-600 mb-6">
                    {error?.statusText || error?.message || 'La página que buscas no existe.'}
                </p>
                <Link
                    to="/"
                    className="btn-primary inline-block"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    )
}

export default ErrorPage