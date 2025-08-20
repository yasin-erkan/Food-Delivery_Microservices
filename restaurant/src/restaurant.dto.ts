import z from "zod";

// ! openingHoursSchema

const openingHoursSchema = z.object({
    monday: z.string().min(1, "working hours is required on monday"),
    tuesday: z.string().min(1, "working hours is required on tuesday"),
    wednesday: z.string().min(1, "working hours is required on wednesday"),
    thursday: z.string().min(1, "working hours is required on thursday"),
    friday: z.string().min(1, "working hours is required on friday"),
    saturday: z.string().min(1, "working hours is required on saturday"),
    sunday: z.string().min(1, "working hours is required on sunday"),
});

// !restaurantSchema
const restaurantSchema = z.object({
    name: z.string().min(1, "name is required"),
    description: z.string().min(10, "description must be at least 10 characters"),
    address: z.string().min(1, "address is required"),
    phone: z.string().min(1, "phone is required"),
    email: z.email("invalid email address"),
    categories: z.array(z.string()).min(1, "at least one category is required"), // ! categories should be an array of strings
    deliveryTime: z
        .number()
        .min(15, "delivery time must be at least 15 minutes")
        .max(120, "delivery time must be at most 120 minutes"),
    minOrder: z.number().min(0, "minimum order amount must be greater than 0"),
    deliveryFee: z.number().min(0, "delivery fee must be greater than 0"),
    rating: z.number().min(0, "rating must be greater than 0").max(5, "rating must be less than 5").optional(),
    isActive: z.boolean().default(true),
    isOpen: z.boolean().default(true),
    openingHours: openingHoursSchema,
});

// ! menuItemSchema
const menuItemSchema = z.object({
    name: z.string().min(1, "name is required"),
    description: z.string().min(5, "description must be at least 5 characters"),
    price: z.number().min(0, "price must be greater than 0"),
    category: z.string().min(1, "category is required"),
    imageUrl: z.url("invalid image url").optional(),
    ingredients: z.array(z.string()).min(1, "at least one ingredient is required"),
    allergens: z.array(z.string()).default([]),
    isVegetarian: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    preparationTime: z
        .number()
        .min(5, "preparation time must be at least 5 minutes")
        .max(120, "preparation time must be at most 120 minutes"),
});

// ! query params schema
const queryParamsSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    category: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    deliveryTime: z.coerce.number().min(15).max(120).optional(),
    minOrder: z.coerce.number().min(0).optional(),
});

// export type
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type OpeningHoursInput = z.infer<typeof openingHoursSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;


// ! The function that validates the data if it is applicable to the schema,
// ! if not it throws an error for each related field

async function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(z.prettifyError(error));
        }

        throw error;
    }
}

export { validateDto, restaurantSchema, menuItemSchema, openingHoursSchema, queryParamsSchema };