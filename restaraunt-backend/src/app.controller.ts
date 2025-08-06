import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleType } from '@prisma/client';
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

  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.CASHER, RoleType.WAITER)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    console.log('Dashboard stats endpoint called');
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

      // Sof foyda hisoblash
      // Jami tushum = totalRevenue
      // Xarajatlar = mahsulotlar narxi + boshqa xarajatlar
      // Sof foyda = Jami tushum - Xarajatlar
      const totalRevenueAmount = totalRevenue._sum.total || 0;

      // Xarajatlar hisoblash (mahsulotlar narxi + boshqa xarajatlar)
      // Taxminiy xarajatlar: mahsulotlar narxi (50%) + boshqa xarajatlar (10%)
      const productCost = totalRevenueAmount * 0.5; // Mahsulotlar narxi
      const otherCosts = totalRevenueAmount * 0.1; // Boshqa xarajatlar (ijara, elektr, ishchilar maoshi)
      const totalCosts = productCost + otherCosts;

      const netProfit = totalRevenueAmount - totalCosts;

      console.log('Revenue:', totalRevenueAmount);
      console.log('Product Cost:', productCost);
      console.log('Other Costs:', otherCosts);
      console.log('Total Costs:', totalCosts);
      console.log('Net Profit:', netProfit);

      return {
        totalUsers,
        totalRestaurants,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenueAmount,
        netProfit: Math.round(netProfit), // Butun sonlarga yaxlitlash
      };
    } catch (error) {
      throw new Error('Dashboard stats olishda xatolik');
    }
  }
}
