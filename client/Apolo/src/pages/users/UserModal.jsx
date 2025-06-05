import { useState, useEffect } from 'react'
import * as userService from '../../service/userService'
import Swal from 'sweetalert2'

const UserModal = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        isAdmin: false,
        isActive: false
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    const roles = [
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' }
    ]

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                role: user.role || 'user',
                isAdmin: user.isAdmin || false,
                isActive: user.isActive !== undefined ? user.isActive : false
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        let newValue = type === 'checkbox' ? checked : value

        // Sincronizar role e isAdmin
        if (name === 'role') {
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                isAdmin: newValue === 'admin'
            }))
        } else if (name === 'isAdmin') {
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                role: newValue ? 'admin' : 'user'
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }))
        }

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido'
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Formato de email inválido'
        }

        // Solo validar contraseña si es usuario nuevo o si se está cambiando
        if (!user || formData.password) {
            if (!formData.password) {
                newErrors.password = 'La contraseña es requerida'
            } else if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const dataToSend = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                role: formData.role,
                isAdmin: formData.isAdmin,
                isActive: formData.isActive
            }

            // Solo incluir contraseña si se proporcionó
            if (formData.password) {
                dataToSend.password = formData.password
            }

            if (user) {
                await userService.updateUser(user._id, dataToSend)
                Swal.fire({
                    title: '¡Usuario actualizado!',
                    text: 'El usuario ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            } else {
                await userService.createUser(dataToSend)
                Swal.fire({
                    title: '¡Usuario creado!',
                    text: 'El usuario ha sido creado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            }

            onSuccess()
        } catch (error) {
            console.error('Error al guardar usuario:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el usuario',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <h2 className="text-xl font-semibold text-white">
                        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nombre de usuario */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Nombre de Usuario *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.username ? 'border-red-500' : 'border-zinc-600'
                                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                            placeholder="Ingresa el nombre de usuario"
                        />
                        {errors.username && (
                            <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-zinc-600'
                                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                            placeholder="usuario@ejemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            {user ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 pr-12 rounded-lg border ${errors.password ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder={user ? 'Dejar vacío para mantener actual' : 'Ingresa la contraseña'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    {formData.password && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Confirmar Contraseña *
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="Confirma la contraseña"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    )}

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Rol de Usuario
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="isAdmin"
                                checked={formData.isAdmin}
                                onChange={handleChange}
                                className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label className="text-sm font-medium text-zinc-300">
                                Es Administrador
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500 focus:ring-2"
                            />
                            <label className="text-sm font-medium text-zinc-300">
                                Usuario activo
                            </label>
                        </div>
                    </div>

                    {/* Información sincronizada */}
                    {formData.role !== (formData.isAdmin ? 'admin' : 'user') && (
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm">
                                ℹ️ El rol y el estado de administrador se sincronizarán automáticamente
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            )}
                            <span>{user ? 'Actualizar' : 'Crear'} Usuario</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UserModal