const customerSchema = new mongoose.Schema({
    codigo_cliente: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellidoP: {
        type: String,
        required: true,
        trim: true
    },
    apellidoM: {
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
    razon_social: {
        type: String,
        trim: true
    },
    correo_electronico: {
        type: String,
        trim: true,
        lowercase: true
    },
    estado_cliente: {
        type: Boolean,
        default: true
    },
    fecha_alta: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Customer', customerSchema);