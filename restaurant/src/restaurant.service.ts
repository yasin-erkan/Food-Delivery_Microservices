import type { MenuItemInput, QueryParamsInput, RestaurantInput } from "./restaurant.dto.ts";
import { MenuItem, Restaurant } from "./restaurant.model.ts";

// ! Restaurant Service is a class that contains the "business logic" for the restaurant routes
class RestaurantService {
    constructor() { }

    async getAll(query: QueryParamsInput) {

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (query.category) filter.categories = query.category;
        if (query.rating !== undefined) filter.rating = { $gte: query.rating }; // mongoose gte= greater than or equal to
        if (query.deliveryTime !== undefined) filter.deliveryTime = { $lte: query.deliveryTime }; // mongoose lte= less than or equal to
        if (query.minOrder !== undefined) filter.minOrder = { $lte: query.minOrder };

        const [items, total] = await Promise.all([  // ! Promise.all is a method that runs multiple promises in parallel and returns an array of results
            Restaurant.find(filter).skip(skip).limit(limit),
            Restaurant.countDocuments(filter),
        ]);

        return { items, total, page, limit };

    }

    async getById(restaurantId: string) {
        return await Restaurant.findById(restaurantId);
    }

    async getMenu(restaurantId: string, category?: string) {
        const filter: { restaurantId: string; category?: string } = { restaurantId };

        if (category) {
            filter.category = category;
        }

        return await MenuItem.find(filter);
    }

    async addMenuItem(data: MenuItemInput, restaurantId: string) {
        const newItem = await MenuItem.create({ ...data, restaurantId });

        return newItem;
    }

    async create(data: RestaurantInput, ownerId: string) {
        const newRestaurant = await Restaurant.create({ ...data, ownerId });

        return newRestaurant;
        console.log(newRestaurant);
    }
}

export default new RestaurantService();