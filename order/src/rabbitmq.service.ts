import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import type { IOrder } from "./types/types.ts";
import { timeStamp } from "console";

class RabbitMQService {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private readonly exchangeName = "food_delivery_exchange";
    private readonly orderQueue = "order_queue";
    private readonly deliveryQueue = "delivery_queue";


    async initialize(): Promise<void> {
        try {
            // connection
            const url = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
            this.connection = await amqp.connect(url);

            // channel
            this.channel = await this.connection.createChannel();

            // exchange
            await this.channel.assertExchange(this.exchangeName, "topic", { durable: true });

            // queue
            await this.channel.assertQueue(this.orderQueue, { durable: true });
            await this.channel.assertQueue(this.deliveryQueue, { durable: true });

            // queue'ları exchange'e bağla
            await this.channel.bindQueue(this.deliveryQueue, this.exchangeName, "order.created");
            await this.channel.bindQueue(this.deliveryQueue, this.exchangeName, "order.ready");

            console.log("Order Service RabbitMQ bağlantısı başarılı");
        } catch (error) {
            console.error("Order Service RabbitMQ bağlantısı hatası:", error);
        }
    }

    /*
     * publishOrderCreated:
     * - Routing key: order.created
     * - {persistent: true} ->
     */
    async publishOrderCreated(order: IOrder): Promise<void> {
        if (!this.channel) {
            throw new Error("RabbitMQ kanalı başlatılmamış");
        }

        // yayınlanacak mesajı oluştur
        const message = Buffer.from(JSON.stringify(order));

        // mesajı yayınla
        await this.channel.publish(this.exchangeName, "order.created", message, { persistent: true });

        console.log(`Sipariş oluşturma mesajı yayınlandı`);
    }

    /*
     * Sipariş hazır olduğunda olayı yayınla:
     * - Routing key: order.ready
     */
    async publishOrderReady(order: IOrder): Promise<void> {
        if (!this.channel) {
            throw new Error("RabbitMQ kanalı başlatılmamış");
        }

        // yayınlanacak mesajı oluştur
        const message = {
            orderId: order.id,
            userId: order.userId,
            restaurantId: order.restaurantId,
            deliveryAddress: order.deliveryAddress,
            estimatedDeliveryTime: 30,
            timeStamp: new Date().toISOString(),
        };

        // mesajı hazırla
        const messageBuffer = Buffer.from(JSON.stringify(message));

        // mesajı yayınla
        await this.channel.publish(this.exchangeName, "order.ready", messageBuffer, { persistent: true });

        console.log(`Sipariş hazır mesajı yayınlandı`);
    }
}

export default new RabbitMQService();