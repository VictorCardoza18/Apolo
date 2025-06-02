import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
    codigo_venta: {
        type: String,
        required: true,
        unique: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precio_unitario: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    total_general: {
        type: Number,
        required: true
    },
    metodo_pago: {
        type: String,
        enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia'],
        required: true
    },
    fecha_hora: {
        type: Date,
        default: Date.now
    },
    estado_venta: {
        type: String,
        enum: ['completada', 'cancelada', 'pendiente'],
        default: 'completada'
    }
}, {
    timestamps: true
});

export default mongoose.model('Sale', saleSchema);