import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  async place(@Body() dto: CreateOrderDto, @Query("actorId") actorId?: string) {
    return this.orders.placeOrder(dto, actorId ?? null);
  }

  @Post(":id/cancel")
  async cancel(@Param("id") id: string, @Query("actorId") actorId?: string) {
    return this.orders.cancelOrder(id, actorId ?? null);
  }

  @Get()
  async list(@Query("accountId") accountId?: string) {
    return this.orders.list(accountId as any);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    // for MVP reuse list/find
    const orders = await this.orders.list();
    return orders.find((o: any) => o.id === id) || null;
  }
}
