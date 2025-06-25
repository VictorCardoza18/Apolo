import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    consulta: {
        type: String,
        required: true,
        trim: true
    },
    respuesta: {
        type: String,
        required: true
    },
    tipo_consulta: {
        type: String,
        enum: ['SALES', 'PRODUCTS', 'CUSTOMERS', 'REPORTS', 'ANALYTICS', 'HELP', 'GENERAL'],
        default: 'GENERAL'
    },
    metadata: {
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        },
        dataReturned: {
            type: Boolean,
            default: false
        },
        chartsGenerated: {
            type: Boolean,
            default: false
        },
        processingTime: {
            type: Number,
            default: 0
        }
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        },
        fecha: {
            type: Date
        }
    },
    fecha_consulta: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
chatHistorySchema.index({ usuario: 1, fecha_consulta: -1 });
chatHistorySchema.index({ tipo_consulta: 1 });
chatHistorySchema.index({ fecha_consulta: 1 });
chatHistorySchema.index({ 'feedback.rating': 1 });

export default mongoose.model('ChatHistory', chatHistorySchema);