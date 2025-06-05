import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        optional: true,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    },
    isActive: {
        type: Boolean,
        optional: true,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

const createFirstAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

        if (!mongoUri) {
            console.error('❌ Error: No se encontró la URI de MongoDB');
            process.exit(1);
        }

        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un administrador
        const adminExists = await User.findOne({
            $or: [
                { role: 'admin' },
                { isAdmin: true }
            ]
        });

        if (adminExists) {
            console.log('⚠️  Ya existe un administrador en el sistema:');
            console.log(`   Username: ${adminExists.username}`);
            console.log(`   Email: ${adminExists.email}`);
            console.log(`   Role: ${adminExists.role}`);
            console.log(`   IsAdmin: ${adminExists.isAdmin}`);
            process.exit(0);
        }

        // Crear administrador
        const hashedPassword = await bcrypt.hash('admin123', 12);

        const adminData = {
            username: 'admin',
            email: 'admin@apolopos.com',
            password: hashedPassword,
            role: 'admin',      // Campo role
            isAdmin: true,      // Campo isAdmin
            isActive: true      // Usuario activo
        };

        const admin = await User.create(adminData);
        console.log('🎉 ¡Primer administrador creado exitosamente!');
        console.log('📋 Credenciales de acceso:');
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   IsAdmin: ${admin.isAdmin}`);
        console.log(`   IsActive: ${admin.isActive}`);
        console.log('');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

    } catch (error) {
        console.error('❌ Error al crear administrador:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('📴 Desconectado de MongoDB');
        process.exit(0);
    }
};

createFirstAdmin();