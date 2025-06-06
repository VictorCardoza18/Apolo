import { useMemo } from 'react'

const Chart = ({ data, type = 'bar', height = 200, color = '#3b82f6' }) => {
    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 0
        return Math.max(...data.map(item => item.value))
    }, [data])

    const renderBarChart = () => (
        <div className="flex items-end justify-between h-full space-x-2">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div className="text-xs text-zinc-400 font-medium">
                        ${typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    </div>
                    <div className="w-full bg-zinc-700 rounded-t flex flex-col justify-end" style={{ height: '80%' }}>
                        <div
                            className="rounded-t transition-all duration-500 ease-out"
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: color,
                                minHeight: item.value > 0 ? '4px' : '0px'
                            }}
                        />
                    </div>
                    <div className="text-xs text-zinc-300 text-center">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    )

    const renderLineChart = () => (
        <div className="relative w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                <g stroke="#374151" strokeWidth="0.5">
                    {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} />
                    ))}
                </g>

                {/* Data line */}
                {data.length > 1 && (
                    <g>
                        <polyline
                            fill="url(#lineGradient)"
                            stroke={color}
                            strokeWidth="2"
                            points={data.map((item, index) =>
                                `${(index / (data.length - 1)) * 400},${200 - (item.value / maxValue) * 160}`
                            ).join(' ')}
                        />
                        {/* Data points */}
                        {data.map((item, index) => (
                            <circle
                                key={index}
                                cx={(index / (data.length - 1)) * 400}
                                cy={200 - (item.value / maxValue) * 160}
                                r="4"
                                fill={color}
                            />
                        ))}
                    </g>
                )}
            </svg>

            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-zinc-400">
                {data.map((item, index) => (
                    <span key={index}>{item.label}</span>
                ))}
            </div>
        </div>
    )

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0)
        let cumulativePercentage = 0

        return (
            <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="transparent"
                            stroke="#374151"
                            strokeWidth="2"
                        />
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100
                            const strokeDasharray = `${percentage} ${100 - percentage}`
                            const strokeDashoffset = -cumulativePercentage
                            cumulativePercentage += percentage

                            const colors = [color, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

                            return (
                                <circle
                                    key={index}
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="transparent"
                                    stroke={colors[index % colors.length]}
                                    strokeWidth="2"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500"
                                />
                            )
                        })}
                    </svg>
                </div>
                <div className="space-y-2">
                    {data.map((item, index) => {
                        const colors = [color, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                        const percentage = ((item.value / total) * 100).toFixed(1)

                        return (
                            <div key={index} className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-sm text-zinc-300">
                                    {item.label}: {percentage}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <p>No hay datos disponibles</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full" style={{ height }}>
            {type === 'bar' && renderBarChart()}
            {type === 'line' && renderLineChart()}
            {type === 'pie' && renderPieChart()}
        </div>
    )
}

export default Chart