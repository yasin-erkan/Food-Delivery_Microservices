import { model, Schema } from "mongoose";
import type { IAddress, IUser } from "./types/types.ts";
import bcrypt from "bcrypt";


//address schema
const addressSchema = new Schema<IAddress>({
    title: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
},
    { _id: true }
);


//user schema
const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['customer', 'restaurant_owner', 'courier', 'admin'],
        default: 'customer'
    },
    addresses: {
        type: [addressSchema],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        },
    },
}
);

//pre-save hook to hash the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (error) {
        return next(error as Error);
    }
});

//compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};


// ! indexing  particularly for filtering
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });


const User = model('User', userSchema,);

export default User;