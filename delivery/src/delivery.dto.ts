import { z } from "zod";

// courier register
const courierRegisterSchema = z.object({
    email: z.email("ENTER A VALID EMAIL"),
    password: z.string().min(6, "PASSWORD MUST BE AT LEAST 6 CHARACTERS"),
    firstName: z.string().min(2, "FIRST NAME MUST BE AT LEAST 2 CHARACTERS"),
    lastName: z.string().min(2, "LAST NAME MUST BE AT LEAST 2 CHARACTERS"),
    phone: z.string().min(10, "PHONE NUMBER MUST BE AT LEAST 10 CHARACTERS"),
    vehicleType: z.enum(["motorcycle", "bicycle", "car"]),
    vehiclePlate: z.string().optional(),
    isActive: z.boolean().default(true),
});

// courier login
const courierLoginSchema = z.object({
    email: z.email("ENTER A VALID EMAIL"),
    password: z.string().min(6, "PASSWORD MUST BE AT LEAST 6 CHARACTERS"),
});

// courier status update
const courierStatusUpdateSchema = z.object({
    status: z.enum(["available", "busy", "offline"]),
    location: z
        .object({
            latitude: z.number().min(-90).max(90, "ENTER A VALID LATITUDE"),
            longtitude: z.number().min(-180).max(180, "ENTER A VALID LONGITUDE"),
        })
        .optional(),
});

// delivery status update
const deliveryStatusUpdateSchema = z.object({
    status: z.enum(["assigned", "picked_up", "in_transit", "delivered", "failed"]),
    location: z
        .object({
            latitude: z.number().min(-90).max(90, "ENTER A VALID LATITUDE"),
            longtitude: z.number().min(-180).max(180, "ENTER A VALID LONGITUDE"),
        })
        .optional(),
    estimatedArrival: z.number().min(1, "ESTIMATED ARRIVAL MUST BE AT LEAST 1 MINUTE").optional(),
    actualArrival: z.date().optional(),
    notes: z.string().optional(),
});

// courier performance
const courierPerformanceSchema = z.object({
    deliveriesCompleted: z.number().min(0, "DELIVERIES COMPLETED MUST BE AT LEAST 0"),
    averageRating: z.number().min(0).max(5, "AVERAGE RATING MUST BE BETWEEN 0 AND 5"),
    totalEarnings: z.number().min(0, "TOTAL EARNINGS MUST BE AT LEAST 0"),
    period: z.enum(["daily", "weekly", "monthly"]),
});

// location update
const locationUpdateSchema = z.object({
    latitude: z.number().min(-90).max(90, "ENTER A VALID LATITUDE"),
    longtitude: z.number().min(-180).max(180, "ENTER A VALID LONGITUDE"),
    timestamp: z.date().optional(),
});

// export schemas
export {
    courierRegisterSchema,
    courierLoginSchema,
    courierStatusUpdateSchema,
    deliveryStatusUpdateSchema,
    courierPerformanceSchema,
    locationUpdateSchema,
};

// type inference
export type CourierRegisterInput = z.infer<typeof courierRegisterSchema>;
export type CourierLoginInput = z.infer<typeof courierLoginSchema>;
export type CourierStatusUpdateInput = z.infer<typeof courierStatusUpdateSchema>;
export type DeliveryStatusUpdateInput = z.infer<typeof deliveryStatusUpdateSchema>;
export type CourierPerformanceInput = z.infer<typeof courierPerformanceSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;

// THE FUNCTION THAT VALIDATES THE DATA AGAINST THE SCHEMA
export async function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(z.prettifyError(error));
        }

        throw error;
    }
}

