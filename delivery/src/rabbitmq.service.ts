import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import type { IOrder } from "./types/types.ts";
import { Courier, DeliveryTracking } from "./delivery.model.ts";

class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchangeName = "food_delivery_exchange";
  private readonly orderQueue = "order_queue";
  private readonly deliveryQueue = "delivery_queue";

  /*
   * Connect to the broker, create a channel, create exchanges/queues
   * Notes:
   * - Exchange type: "topic": routing key values (e.g: order.*) are routed
   * - {durable: true} -> RabbitMQ restart will keep the exchange
   */
  async initialize(): Promise<void> {
    try {
      // Broker'a bağlan
      const url = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";
      this.connection = await amqp.connect(url);

      // create channel
      this.channel = await this.connection.createChannel();

      // create exchange
      await this.channel.assertExchange(this.exchangeName, "topic", { durable: true });

      // create queue
      await this.channel.assertQueue(this.orderQueue, { durable: true });
      await this.channel.assertQueue(this.deliveryQueue, { durable: true });

      // bind queues to exchange
      await this.channel.bindQueue(this.deliveryQueue, this.exchangeName, "order.created");
      await this.channel.bindQueue(this.deliveryQueue, this.exchangeName, "order.ready");

      // listen to queues
      await this.listenToDeliveryQueue();

      console.log("Delivery Service RabbitMQ connection successful");
    } catch (error) {
      console.error("Delivery Service RabbitMQ bağlantısı hatası:", error);
    }
  }

  // listen to delivery queue
  // listen to messages when order is created and ready
  // perform necessary actions
  async listenToDeliveryQueue(): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ bağlantısı kurulamadı");
    }

    await this.channel.consume(this.deliveryQueue, async (message) => {
      // convert buffer to json
      const deliveryMessage = JSON.parse(message!.content.toString()) as IOrder;

      if (deliveryMessage.status === "pending") {
        // if order status is pending, create a new delivery tracking
        const deliveryTracking = await DeliveryTracking.create({
          orderId: deliveryMessage.id,
          courierId: null,
          status: "pending",
          estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
          notes: deliveryMessage.specialInstructions,
        });

        // find available courier
        const courier = await Courier.findOne({ status: "available", isAvailable: true }).sort({ createdAt: 1 });

        // assign courier to order
        if (courier) {
          // update order data
          await DeliveryTracking.findByIdAndUpdate(deliveryTracking.id, { courierId: courier.id, status: "assigned" });
          // update courier status
          await Courier.findByIdAndUpdate(courier.id, { status: "busy", isAvailable: false });
        }
      }

      // if order status is ready, update delivery tracking
      if (deliveryMessage.status === "ready") {
        await DeliveryTracking.findOneAndUpdate({ orderId: deliveryMessage.id }, { status: "ready" });
      }
    });
  }
}

export default new RabbitMQService();