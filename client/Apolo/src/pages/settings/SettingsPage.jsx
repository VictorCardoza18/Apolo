import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const SettingsPage = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        general: {
            businessName: 'Mi Negocio',
            businessAddress: '',
            businessPhone: '',
            businessEmail: '',
            currency: 'MXN',
            timezone: 'America/Mexico_City',
            language: 'es'
        },
        sales: {
            autoGenerateReceipts: true,
            printReceiptsByDefault: true,
            allowDiscounts: true,
            maxDiscountPercent: 15,
            requireCustomerForSale: false,
            lowStockAlert: true,
            lowStockThreshold: 10
        },
        security: {
            sessionTimeout: 60,
            requirePasswordChange: false,
            enableTwoFactor: false,
            allowMultipleSessions: true,
            auditLog: true
        },
        notifications: {
            emailNotifications: true,
            lowStockAlerts: true,
            dailyReports: false,
            weeklyReports: true,
            systemUpdates: true
        },
        backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            retainBackups: 30,
            lastBackup: '2025-06-08 15:30:00'
        }
    })

    const tabs = [
        { id: 'general', name: 'General', icon: '⚙️' },
        { id: 'sales', name: 'Ventas', icon: '🛒' },
        { id: 'security', name: 'Seguridad', icon: '🔒' },
        { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
        { id: 'backup', name: 'Respaldos', icon: '💾' }
    ]

    const currencies = [
        { code: 'MXN', name: 'Peso Mexicano (MXN)', symbol: '$' },
        { code: 'USD', name: 'Dólar Americano (USD)', symbol: '$' },
        { code: 'EUR', name: 'Euro (EUR)', symbol: '€' }
    ]

    const timezones = [
        { value: 'America/Mexico_City', label: 'México (GMT-6)' },
        { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
        { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' }
    ]

    const handleSettingChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }))
    }

    const handleSaveSettings = async () => {
        setLoading(true)
        try {
            // Simular guardado de configuración
            await new Promise(resolve => setTimeout(resolve, 1500))

            Swal.fire({
                title: '¡Configuración guardada!',
                text: 'Los cambios se han aplicado correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#10b981'
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: 'No se pudieron guardar los cambios',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResetSettings = () => {
        Swal.fire({
            title: '¿Restablecer configuración?',
            text: 'Esto restaurará todas las configuraciones a sus valores por defecto',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, restablecer',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Restablecer a valores por defecto
                setSettings({
                    general: {
                        businessName: 'Mi Negocio',
                        businessAddress: '',
                        businessPhone: '',
                        businessEmail: '',
                        currency: 'MXN',
                        timezone: 'America/Mexico_City',
                        language: 'es'
                    },
                    sales: {
                        autoGenerateReceipts: true,
                        printReceiptsByDefault: true,
                        allowDiscounts: true,
                        maxDiscountPercent: 15,
                        requireCustomerForSale: false,
                        lowStockAlert: true,
                        lowStockThreshold: 10
                    },
                    security: {
                        sessionTimeout: 60,
                        requirePasswordChange: false,
                        enableTwoFactor: false,
                        allowMultipleSessions: true,
                        auditLog: true
                    },
                    notifications: {
                        emailNotifications: true,
                        lowStockAlerts: true,
                        dailyReports: false,
                        weeklyReports: true,
                        systemUpdates: true
                    },
                    backup: {
                        autoBackup: true,
                        backupFrequency: 'daily',
                        retainBackups: 30,
                        lastBackup: '2025-06-08 15:30:00'
                    }
                })

                Swal.fire({
                    title: '¡Configuración restablecida!',
                    text: 'Se han restaurado los valores por defecto',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            }
        })
    }

    const handleBackupNow = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 3000))

            setSettings(prev => ({
                ...prev,
                backup: {
                    ...prev.backup,
                    lastBackup: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
            }))

            Swal.fire({
                title: '¡Respaldo completado!',
                text: 'Se ha creado un respaldo exitosamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#10b981'
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en respaldo',
                text: 'No se pudo crear el respaldo',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Información del Negocio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Nombre del Negocio
                        </label>
                        <input
                            type="text"
                            value={settings.general.businessName}
                            onChange={(e) => handleSettingChange('general', 'businessName', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={settings.general.businessPhone}
                            onChange={(e) => handleSettingChange('general', 'businessPhone', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            placeholder="(55) 1234-5678"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={settings.general.businessEmail}
                            onChange={(e) => handleSettingChange('general', 'businessEmail', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            placeholder="negocio@ejemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Moneda
                        </label>
                        <select
                            value={settings.general.currency}
                            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        >
                            {currencies.map(currency => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Dirección
                    </label>
                    <textarea
                        value={settings.general.businessAddress}
                        onChange={(e) => handleSettingChange('general', 'businessAddress', e.target.value)}
                        rows="3"
                        className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Dirección completa del negocio"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración Regional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Zona Horaria
                        </label>
                        <select
                            value={settings.general.timezone}
                            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        >
                            {timezones.map(tz => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Idioma
                        </label>
                        <select
                            value={settings.general.language}
                            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSalesSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de Ventas</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Generar recibos automáticamente</p>
                            <p className="text-zinc-400 text-sm">Crear recibos al completar una venta</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sales.autoGenerateReceipts}
                            onChange={(e) => handleSettingChange('sales', 'autoGenerateReceipts', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Imprimir recibos por defecto</p>
                            <p className="text-zinc-400 text-sm">Mostrar diálogo de impresión automáticamente</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sales.printReceiptsByDefault}
                            onChange={(e) => handleSettingChange('sales', 'printReceiptsByDefault', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Permitir descuentos</p>
                            <p className="text-zinc-400 text-sm">Habilitar descuentos en las ventas</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sales.allowDiscounts}
                            onChange={(e) => handleSettingChange('sales', 'allowDiscounts', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    {settings.sales.allowDiscounts && (
                        <div className="ml-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Descuento máximo permitido (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={settings.sales.maxDiscountPercent}
                                onChange={(e) => handleSettingChange('sales', 'maxDiscountPercent', parseInt(e.target.value) || 0)}
                                className="w-32 bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Inventario</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Alertas de stock bajo</p>
                            <p className="text-zinc-400 text-sm">Notificar cuando los productos tengan poco stock</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sales.lowStockAlert}
                            onChange={(e) => handleSettingChange('sales', 'lowStockAlert', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    {settings.sales.lowStockAlert && (
                        <div className="ml-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Umbral de stock bajo (unidades)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={settings.sales.lowStockThreshold}
                                onChange={(e) => handleSettingChange('sales', 'lowStockThreshold', parseInt(e.target.value) || 1)}
                                className="w-32 bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de Seguridad</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Tiempo de expiración de sesión (minutos)
                        </label>
                        <select
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                        >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={120}>2 horas</option>
                            <option value={240}>4 horas</option>
                        </select>
                        <p className="text-zinc-400 text-sm mt-2">Tiempo de inactividad antes de cerrar sesión automáticamente</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Autenticación de dos factores</p>
                            <p className="text-zinc-400 text-sm">Agregar una capa extra de seguridad</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.security.enableTwoFactor}
                            onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Permitir múltiples sesiones</p>
                            <p className="text-zinc-400 text-sm">Permitir que un usuario inicie sesión desde varios dispositivos</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.security.allowMultipleSessions}
                            onChange={(e) => handleSettingChange('security', 'allowMultipleSessions', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Registro de auditoría</p>
                            <p className="text-zinc-400 text-sm">Mantener un registro de todas las acciones del sistema</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.security.auditLog}
                            onChange={(e) => handleSettingChange('security', 'auditLog', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preferencias de Notificaciones</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Notificaciones por email</p>
                            <p className="text-zinc-400 text-sm">Recibir notificaciones importantes por correo</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Alertas de stock bajo</p>
                            <p className="text-zinc-400 text-sm">Notificar cuando productos tengan poco inventario</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.lowStockAlerts}
                            onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Reportes semanales</p>
                            <p className="text-zinc-400 text-sm">Recibir resumen semanal de ventas</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Actualizaciones del sistema</p>
                            <p className="text-zinc-400 text-sm">Notificar sobre nuevas versiones y actualizaciones</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.notifications.systemUpdates}
                            onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderBackupSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de Respaldos</h3>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-blue-400 font-medium text-sm">Último respaldo</p>
                            <p className="text-blue-300 text-sm">{settings.backup.lastBackup}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div>
                            <p className="text-white font-medium">Respaldo automático</p>
                            <p className="text-zinc-400 text-sm">Crear respaldos automáticamente</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.backup.autoBackup}
                            onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    {settings.backup.autoBackup && (
                        <div className="ml-4 space-y-4">
                            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Frecuencia de respaldo
                                </label>
                                <select
                                    value={settings.backup.backupFrequency}
                                    onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="hourly">Cada hora</option>
                                    <option value="daily">Diariamente</option>
                                    <option value="weekly">Semanalmente</option>
                                </select>
                            </div>

                            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Retener respaldos (días)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={settings.backup.retainBackups}
                                    onChange={(e) => handleSettingChange('backup', 'retainBackups', parseInt(e.target.value) || 1)}
                                    className="w-32 bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                        <button
                            onClick={handleBackupNow}
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    <span>Creando respaldo...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span>Crear respaldo ahora</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings()
            case 'sales':
                return renderSalesSettings()
            case 'security':
                return renderSecuritySettings()
            case 'notifications':
                return renderNotificationSettings()
            case 'backup':
                return renderBackupSettings()
            default:
                return renderGeneralSettings()
        }
    }

    return (
        <div className="min-h-screen bg-zinc-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-zinc-700 p-3 rounded-full">
                            <svg className="w-8 h-8 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
                            <p className="text-zinc-400">Personaliza y configura tu sistema APOLO POS</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleResetSettings}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Restablecer</span>
                        </button>

                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar con tabs */}
                    <div className="lg:w-1/4">
                        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-lg">{tab.icon}</span>
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:w-3/4">
                        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage