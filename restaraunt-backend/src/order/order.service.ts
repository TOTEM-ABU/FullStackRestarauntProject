import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateOrderDto, req: RequestWithUser) {
    try {
      let restaurant = await this.prisma.restaurant.findFirst({
        where: { id: data.restaurantId },
      });
      if (!restaurant) {
        throw new BadRequestException(
          `Restaurant with ${data.restaurantId} id not found`,
        );
      }

      let total = 0;
      let productCosts = 0;

      for (let i of data.orderItems) {
        let product = await this.prisma.product.findFirst({
          where: { id: i.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Product with ${i.productId} id not found`,
          );
        }

        total += product.price * i.quantity;
        productCosts += product.price * 0.4 * i.quantity;
      }

      const waiterSalary = total * 0.1;
      const otherExpenses = total * 0.15;
      const netProfit = total - (waiterSalary + productCosts + otherExpenses);

      const order = await this.prisma.order.create({
        data: {
          table: data.table,
          restaurantId: data.restaurantId,
          waiterId: null,
          total: total,
          OrderItems: {
            create: data.orderItems.map((item) => ({
              product: {
                connect: { id: item.productId.toString() },
              },
              quantity: item.quantity,
            })),
          },
        },
        include: {
          Restaurant: true,
          Waiter: true,
          OrderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      await this.prisma.withdraw.create({
        data: {
          type: 'OUTCOME',
          amount: waiterSalary,
          description: `Ofitsiant maoshi`,
          restaurantId: data.restaurantId,
          orderId: order.id,
        },
      });

      await this.prisma.withdraw.create({
        data: {
          type: 'OUTCOME',
          amount: productCosts,
          description: `Mahsulot xarajatlari`,
          restaurantId: data.restaurantId,
          orderId: order.id,
        },
      });

      await this.prisma.withdraw.create({
        data: {
          type: 'OUTCOME',
          amount: otherExpenses,
          description: `Boshqa xarajatlar`,
          restaurantId: data.restaurantId,
          orderId: order.id,
        },
      });

      await this.prisma.withdraw.create({
        data: {
          type: 'INCOME',
          amount: netProfit,
          description: `Sof foyda`,
          restaurantId: data.restaurantId,
          orderId: order.id,
        },
      });

      const orderCreator = req.user;
      if (orderCreator && orderCreator.id) {
        await this.prisma.user.update({
          where: { id: orderCreator.id },
          data: { balans: { increment: waiterSalary } },
        });
      }

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: {
    restaurantId?: string;
    productId?: string;
    quantity?: number;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      restaurantId,
      productId,
      quantity,
      sort = 'desc',
      page = 1,
      limit = 10,
    } = query;

    try {
      const skip = (page - 1) * limit;

      const orders = await this.prisma.order.findMany({
        where: {
          restaurantId: restaurantId || undefined,
          OrderItems: {
            some: {
              productId: productId || undefined,
              quantity: quantity ? quantity : undefined,
            },
          },
        },
        include: {
          Restaurant: true,
          Waiter: true,
          OrderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: sort,
        },
        skip,
        take: limit,
      });

      const total = await this.prisma.order.count({
        where: {
          restaurantId: restaurantId || undefined,
          OrderItems: {
            some: {
              productId: productId || undefined,
              quantity: quantity ? quantity : undefined,
            },
          },
        },
      });

      return {
        data: orders,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Buyurtmalarni olishda xatolik: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          Restaurant: true,
          Waiter: true,
          OrderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const existing = await this.prisma.order.findUnique({ where: { id } });

      if (!existing) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.order.findUnique({
        where: { id },
        include: {
          OrderItems: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      await this.prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      await this.prisma.order.delete({ where: { id } });

      return { message: `Order with id ${id} removed successfully` };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
