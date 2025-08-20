import { z } from "zod";




// ! to check the data before sending it to the service


const registerSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    firstName: z.string().min(3, { message: "First name must be at least 3 characters" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters" }),
    phone: z.string().min(6, { message: "Phone number must be at least 6 characters" }),
    role: z.enum(["customer", "restaurant_owner", "courier", "admin"]).default("customer"),

})

// for login validation with ZOD
const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const addressSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    address: z.string().min(3, { message: "Address must be at least 3 characters" }),
    city: z.string().min(3, { message: "City must be at least 3 characters" }),
    district: z.string().min(3, { message: "District must be at least 3 characters" }).optional(),
    postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters" }),
    isDefault: z.boolean().default(false),
})

// for type inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;



// the function to validate the data before sending it to the service
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



export { validateDto, registerSchema, loginSchema, addressSchema };

