import mongoose, { model, Schema } from "mongoose";
import type { Address, IOrder, OrderItem } from "./types/types.ts";

// ordered product type
const orderItemSchema = new Schema<OrderItem>(
    {
        productId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    {
        _id: false,
    }
);

// order delivery address type
const addressSchema = new Schema<Address>(
    {
        title: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        postalCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

// order model
const orderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, required: true },
        restaurantId: { type: Schema.Types.ObjectId, required: true },
        items: { type: [orderItemSchema], required: true },
        totalAmount: { type: Number, required: true, min: 0 },
        deliveryAddress: { type: addressSchema, required: true },
        paymentMethod: { type: String, required: true, enum: ["credit_card", "cash", "online"] },
        status: {
            type: String,
            required: true,
            enum: ["pending", "confirmed", "preparing", "ready", "on_the_way", "delivered", "cancelled"],
        },
        specialInstructions: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc: any, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

// model
export const Order = mongoose.model("Order", orderSchema);