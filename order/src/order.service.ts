import type { OrderInput } from "./order.dto.ts";
import { Order } from "./order.model.ts";
import type { IOrder } from "./types/types.ts";
import RabbitMQService from "./rabbitmq.service.ts";





//business logic
class OrderService {
    private initialized = false;

    async initialize(): Promise<void> {
        if (!this.initialized) {
            await RabbitMQService.initialize();
            this.initialized = true;
        }
    }

    async createOrder(userId: string, orderData: OrderInput): Promise<IOrder> {
        // initialize the RabbitMQService
        await this.initialize();

        //calculate total amount
        const totalAmount = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // create order
        const order = await Order.create({
            userId,
            restaurantId: orderData.restaurantId,
            items: orderData.items,
            totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            specialInstructions: orderData.specialInstructions,
            status: "pending",
        });

        // publish the order to the exchange
        await RabbitMQService.publishOrderCreated(order);

        return order;
    }


    async getOrderById(orderId: string) {
        return await Order.findById(orderId);
    }


    async getUserOrders(userId: string) {
        return await Order.find({ userId });
    }


    async updateOrderStatus(orderId: string, newStatus: string) {
        const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
        // publish when order exists and becomes ready
        if (order && newStatus === "ready") {
            // initialize the RabbitMQService
            await this.initialize();

            // publish the order to the exchange
            await RabbitMQService.publishOrderReady(order);
        }
        return order;
    }
}

export default new OrderService();