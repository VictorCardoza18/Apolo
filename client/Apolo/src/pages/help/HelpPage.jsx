import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const HelpPage = () => {
    const { user } = useAuth()
    const [activeSection, setActiveSection] = useState('getting-started')
    const [searchTerm, setSearchTerm] = useState('')
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    })

    const sections = [
        {
            id: 'getting-started',
            title: 'Primeros Pasos',
            icon: '🚀',
            description: 'Aprende lo básico para usar APOLO POS'
        },
        {
            id: 'sales',
            title: 'Gestión de Ventas',
            icon: '🛒',
            description: 'Cómo procesar ventas y manejar el POS'
        },
        {
            id: 'inventory',
            title: 'Inventario',
            icon: '📦',
            description: 'Administración de productos y stock'
        },
        {
            id: 'customers',
            title: 'Clientes',
            icon: '👥',
            description: 'Gestión de base de datos de clientes'
        },
        {
            id: 'reports',
            title: 'Reportes',
            icon: '📊',
            description: 'Generar y entender reportes de ventas'
        },
        {
            id: 'troubleshooting',
            title: 'Solución de Problemas',
            icon: '🔧',
            description: 'Resolver problemas comunes'
        },
        {
            id: 'contact',
            title: 'Contactar Soporte',
            icon: '💬',
            description: 'Obtener ayuda personalizada'
        }
    ]

    const faqs = {
        'getting-started': [
            {
                question: '¿Cómo inicio sesión en el sistema?',
                answer: 'Usa tu nombre de usuario y contraseña proporcionados por el administrador. Si olvidaste tu contraseña, contacta al administrador para restablecerla.'
            },
            {
                question: '¿Qué puedo hacer como usuario normal?',
                answer: 'Como usuario normal, puedes acceder al punto de venta (POS) para procesar ventas y gestionar la información de clientes.'
            },
            {
                question: '¿Cómo navego por el sistema?',
                answer: 'Usa el menú hamburguesa en la parte superior derecha para acceder a todas las funciones disponibles según tu rol de usuario.'
            },
            {
                question: '¿Dónde veo mi información de cuenta?',
                answer: 'Tu información aparece en la barra superior central. Muestra tu nombre, rol (Usuario/Administrador) y estado de cuenta.'
            }
        ],
        'sales': [
            {
                question: '¿Cómo proceso una venta?',
                answer: 'Ve al módulo POS, busca productos, agrégalos al carrito, selecciona el cliente (opcional), elige el método de pago y confirma la venta.'
            },
            {
                question: '¿Puedo aplicar descuentos?',
                answer: 'Sí, si tienes permisos y está habilitado en la configuración, puedes aplicar descuentos durante el proceso de venta.'
            },
            {
                question: '¿Cómo cancelo una venta?',
                answer: 'Solo los administradores pueden cancelar ventas. Contacta a tu supervisor si necesitas cancelar una transacción.'
            },
            {
                question: '¿Qué métodos de pago puedo usar?',
                answer: 'El sistema soporta efectivo, tarjeta de débito, tarjeta de crédito y transferencias. El administrador puede configurar métodos adicionales.'
            },
            {
                question: '¿Cómo imprimo un recibo?',
                answer: 'Después de completar una venta, aparecerá automáticamente la opción de imprimir el recibo. También puedes reimprimir desde el historial de ventas.'
            }
        ],
        'inventory': [
            {
                question: '¿Cómo agrego nuevos productos?',
                answer: 'Solo los administradores pueden agregar productos. Ve a Gestión de Productos > Nuevo Producto y completa la información requerida.'
            },
            {
                question: '¿Cómo actualizo el stock?',
                answer: 'En la sección de Productos, encuentra el producto y edita la cantidad en stock. El sistema actualizará automáticamente.'
            },
            {
                question: '¿Qué significan las alertas de stock bajo?',
                answer: 'Cuando un producto tiene menos del umbral configurado (por defecto 10 unidades), aparecerá en las alertas de stock bajo.'
            },
            {
                question: '¿Cómo busco productos rápidamente?',
                answer: 'Usa la barra de búsqueda por nombre, código de producto o categoría. También puedes usar filtros para encontrar productos específicos.'
            },
            {
                question: '¿Puedo ver el historial de movimientos de inventario?',
                answer: 'Sí, los administradores pueden ver el historial completo de movimientos de stock en la sección de reportes de inventario.'
            }
        ],
        'customers': [
            {
                question: '¿Cómo registro un nuevo cliente?',
                answer: 'Ve a Gestión de Clientes > Nuevo Cliente. Completa al menos el nombre y apellido. El resto de la información es opcional pero recomendable.'
            },
            {
                question: '¿Puedo editar información de clientes?',
                answer: 'Sí, todos los usuarios pueden editar la información de clientes existentes desde la lista de clientes.'
            },
            {
                question: '¿Es obligatorio registrar clientes para las ventas?',
                answer: 'No, puedes procesar ventas sin cliente registrado, pero es recomendable para mejor seguimiento y reportes.'
            },
            {
                question: '¿Cómo busco un cliente específico?',
                answer: 'Usa la función de búsqueda por nombre, apellido, email o teléfono. También puedes filtrar por estado del cliente.'
            },
            {
                question: '¿Puedo ver el historial de compras de un cliente?',
                answer: 'Sí, en el perfil del cliente puedes ver todas sus compras anteriores, fechas y montos totales.'
            }
        ],
        'reports': [
            {
                question: '¿Cómo genero un reporte de ventas?',
                answer: 'Solo los administradores pueden acceder a reportes. Ve a Reportes > Reporte de Ventas y selecciona el período deseado.'
            },
            {
                question: '¿Puedo exportar los reportes?',
                answer: 'Sí, los reportes se pueden exportar en formato Excel o PDF usando los botones de exportación en la parte superior.'
            },
            {
                question: '¿Con qué frecuencia se actualizan los datos?',
                answer: 'Los datos se actualizan en tiempo real. Puedes usar el botón "Actualizar" para refrescar la información manualmente.'
            },
            {
                question: '¿Qué tipos de reportes están disponibles?',
                answer: 'Hay reportes de ventas por período, productos más vendidos, rendimiento por vendedor, y análisis de clientes.'
            },
            {
                question: '¿Puedo ver reportes de períodos personalizados?',
                answer: 'Sí, puedes seleccionar fechas específicas de inicio y fin para generar reportes de cualquier período.'
            }
        ],
        'troubleshooting': [
            {
                question: '¿Qué hago si el sistema está lento?',
                answer: 'Verifica tu conexión a internet. Si el problema persiste, cierra otras aplicaciones y contacta al soporte técnico.'
            },
            {
                question: '¿Por qué no puedo acceder a ciertas funciones?',
                answer: 'Tu cuenta puede no tener los permisos necesarios. Contacta al administrador para verificar tu rol de usuario.'
            },
            {
                question: '¿Qué hago si encuentro un error?',
                answer: 'Toma una captura de pantalla del error, anota los pasos que realizaste y contacta al soporte técnico con estos detalles.'
            },
            {
                question: '¿Por qué se cerró mi sesión automáticamente?',
                answer: 'Por seguridad, las sesiones expiran después de un período de inactividad. Vuelve a iniciar sesión para continuar.'
            },
            {
                question: '¿Qué hago si no puedo imprimir recibos?',
                answer: 'Verifica que tu impresora esté conectada y tenga papel. Revisa la configuración de impresión en tu navegador.'
            },
            {
                question: '¿Por qué no aparecen algunos productos en el POS?',
                answer: 'Los productos pueden estar desactivados o sin stock. Contacta al administrador para verificar el estado de los productos.'
            }
        ]
    }

    const handleContactSubmit = async (e) => {
        e.preventDefault()

        if (!contactForm.subject.trim() || !contactForm.message.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa el asunto y el mensaje',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        try {
            // Simular envío de mensaje
            await new Promise(resolve => setTimeout(resolve, 1500))

            Swal.fire({
                title: '¡Mensaje enviado!',
                text: 'Nuestro equipo de soporte se pondrá en contacto contigo pronto',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#10b981'
            })

            setContactForm({
                subject: '',
                message: '',
                priority: 'medium'
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: 'No se pudo enviar el mensaje. Intenta nuevamente.',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        }
    }

    const filteredFaqs = activeSection !== 'contact' && faqs[activeSection] ?
        faqs[activeSection].filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        ) : []

    const renderContent = () => {
        if (activeSection === 'contact') {
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Contactar Soporte Técnico</h2>
                        <p className="text-zinc-400 mb-6">
                            ¿No encontraste lo que buscabas? Nuestro equipo de soporte está aquí para ayudarte.
                        </p>
                    </div>

                    {/* Información de contacto rápido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-green-500/50 transition-colors duration-200">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-green-600/20 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Soporte Telefónico</p>
                                    <p className="text-zinc-400 text-sm">+52 (55) 1234-5678</p>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs">Lun - Vie: 9:00 AM - 6:00 PM</p>
                        </div>

                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-blue-500/50 transition-colors duration-200">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-blue-600/20 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Email</p>
                                    <p className="text-zinc-400 text-sm">soporte@apolopos.com</p>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs">Respuesta en 24 horas</p>
                        </div>

                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-purple-500/50 transition-colors duration-200">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-purple-600/20 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Chat en Vivo</p>
                                    <p className="text-zinc-400 text-sm">Disponible ahora</p>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs">Respuesta inmediata</p>
                        </div>
                    </div>

                    {/* Formulario de contacto */}
                    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Enviar Mensaje</h3>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Asunto *
                                    </label>
                                    <input
                                        type="text"
                                        value={contactForm.subject}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                        placeholder="Describe brevemente tu consulta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Prioridad
                                    </label>
                                    <select
                                        value={contactForm.priority}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                                        className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="low">🟢 Baja - Consulta general</option>
                                        <option value="medium">🟡 Media - Problema menor</option>
                                        <option value="high">🟠 Alta - Problema importante</option>
                                        <option value="critical">🔴 Crítica - Sistema no funciona</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows="6"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="Describe tu problema o consulta en detalle. Incluye los pasos que realizaste y cualquier mensaje de error que hayas visto..."
                                />
                            </div>

                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-blue-400 text-sm font-medium">Información de tu cuenta</p>
                                        <p className="text-blue-300 text-sm">Usuario: {user?.username} | Email: {user?.email}</p>
                                        <p className="text-blue-300 text-sm">Esta información se incluirá automáticamente en tu mensaje</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                <span>Enviar Mensaje</span>
                            </button>
                        </form>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-lg p-6">
                        <h4 className="text-emerald-400 font-semibold mb-3">💡 Consejos para obtener ayuda más rápido</h4>
                        <ul className="text-emerald-300 text-sm space-y-2">
                            <li>• Describe claramente el problema y los pasos para reproducirlo</li>
                            <li>• Incluye capturas de pantalla si es posible</li>
                            <li>• Menciona qué navegador y versión estás usando</li>
                            <li>• Indica si el problema ocurre siempre o solo a veces</li>
                            <li>• Si hay mensajes de error, cópialos exactamente</li>
                        </ul>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {/* Buscador */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar en preguntas frecuentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-700 text-white px-4 py-3 pl-10 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                    />
                    <svg className="w-5 h-5 text-zinc-400 absolute left-3 top-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Preguntas frecuentes */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <span className="text-3xl mr-3">{sections.find(s => s.id === activeSection)?.icon}</span>
                        {sections.find(s => s.id === activeSection)?.title} - Preguntas Frecuentes
                    </h2>

                    {filteredFaqs.length > 0 ? (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq, index) => (
                                <div key={index} className="bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors duration-200">
                                    <div className="p-6">
                                        <h3 className="text-white font-medium mb-3 flex items-start">
                                            <span className="text-blue-400 mr-3 text-lg font-bold">Q:</span>
                                            <span className="flex-1">{faq.question}</span>
                                        </h3>
                                        <div className="text-zinc-300 pl-8">
                                            <span className="text-green-400 mr-3 text-lg font-bold">A:</span>
                                            <span>{faq.answer}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <svg className="w-20 h-20 text-zinc-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <p className="text-zinc-400 text-xl mb-2">No se encontraron resultados</p>
                            <p className="text-zinc-500 text-sm">Intenta con otros términos de búsqueda o explora otras secciones</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-zinc-700 p-3 rounded-full">
                            <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Centro de Ayuda y Soporte</h1>
                            <p className="text-zinc-400">Encuentra respuestas rápidas o contacta nuestro equipo de soporte</p>
                        </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600/30 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Hola, {user?.username}</p>
                                    <p className="text-blue-300 text-sm">Tu consulta será procesada con tu información de cuenta</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-400 text-sm">Fecha y hora actual</p>
                                <p className="text-white text-sm font-mono">2025-06-09 23:18:44 UTC</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar con secciones */}
                    <div className="lg:w-1/3">
                        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 sticky top-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                Temas de Ayuda
                            </h3>
                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${activeSection === section.id
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                                : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">{section.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-medium">{section.title}</p>
                                                <p className="text-xs opacity-80">{section.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </nav>

                            {/* Estadísticas de ayuda */}
                            <div className="mt-6 pt-6 border-t border-zinc-700">
                                <h4 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                                    Estadísticas de Soporte
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Tiempo respuesta promedio</span>
                                        <span className="text-emerald-400 font-medium">2.5 hrs</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Satisfacción del cliente</span>
                                        <span className="text-emerald-400 font-medium">98.5%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Casos resueltos hoy</span>
                                        <span className="text-blue-400 font-medium">47</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:w-2/3">
                        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>

                {/* Footer de ayuda */}
                <div className="mt-12 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-xl p-6 border border-zinc-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg w-fit mx-auto mb-3">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Soporte 24/7</h3>
                            <p className="text-zinc-400 text-sm">Nuestro equipo está disponible para ayudarte en cualquier momento</p>
                        </div>
                        <div>
                            <div className="bg-blue-600/20 p-3 rounded-lg w-fit mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Respuesta Rápida</h3>
                            <p className="text-zinc-400 text-sm">Tiempo promedio de respuesta menor a 4 horas</p>
                        </div>
                        <div>
                            <div className="bg-purple-600/20 p-3 rounded-lg w-fit mx-auto mb-3">
                                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Soluciones Expertas</h3>
                            <p className="text-zinc-400 text-sm">Nuestro equipo técnico especializado en APOLO POS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelpPage