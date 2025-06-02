import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    codigo_proveedor: {
        type: String,
        required: true,
        unique: true
    },
    nombre_proveedor: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    correo_electronico: {
        type: String,
        trim: true,
        lowercase: true
    },
    estado_proveedor: {
        type: Boolean,
        default: true
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Supplier', supplierSchema);