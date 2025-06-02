import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    codigo_producto: {
        type: String,
        required: true,
        unique: true
    },
    nombre_producto: {
        type: String,
        required: true,
        trim: true
    },
    descripcion_producto: {
        type: String,
        required: true,
    },
    codigo_proveedor: {
        type: String,
        ref: 'Supplier.codigo_proveedor'
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    stock_minimo: {
        type: Number,
        default: 5,
        min: 0
    },
    stock_actual: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    unidad_medida: {
        type: String,
        enum: ['unidad', 'kg', 'litro', 'paquete'],
        default: 'unidad'
    },
    categoria_producto: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

export default mongoose.model('Product', productSchema);