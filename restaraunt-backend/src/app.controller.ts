import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalRestaurants,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.restaurant.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.order.aggregate({
          _sum: { total: true },
        }),
      ]);

      return {
        totalUsers,
        totalRestaurants,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      };
    } catch (error) {
      throw new Error('Dashboard stats olishda xatolik');
    }
  }
}
