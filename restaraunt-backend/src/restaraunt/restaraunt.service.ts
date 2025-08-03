import { Injectable } from '@nestjs/common/decorators';
import { CreateRestarauntDto } from './dto/create-restaraunt.dto';
import { UpdateRestarauntDto } from './dto/update-restaraunt.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestarauntService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateRestarauntDto) {
    try {
      let region = await this.prisma.region.findFirst({
        where: { id: data.regionId },
      });
      if (!region) {
        throw new BadRequestException(
          `Region with ${data.regionId} id not found`,
        );
      }

      if (data.tip !== undefined) {
        data.tip = Number(data.tip);
        if (isNaN(data.tip) || data.tip < 0 || data.tip > 100) {
          throw new BadRequestException(
            'Tip must be a number between 0 and 100',
          );
        }
      }

      let rest = await this.prisma.restaurant.create({ data });
      return rest;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: any) {
    try {
      const {
        name,
        tip,
        address,
        page = 1,
        limit = 10,
        regionId,
        isActive,
      } = query;
      const filter: any = {};

      if (name) {
        filter.name = { contains: name, mode: 'insensitive' };
      }

      if (address) {
        filter.address = { contains: address, mode: 'insensitive' };
      }

      if (regionId) {
        filter.regionId = regionId;
      }

      if (typeof tip !== 'undefined') {
        filter.tip = Number(tip);
      }

      if (typeof isActive !== 'undefined') {
        filter.isActive = isActive === 'true' || isActive === true;
      }

      const restaurants = await this.prisma.restaurant.findMany({
        where: filter,
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          Region: true,
          Products: true,
          Users: true,
          Orders: true,
          Categories: true,
          Withdraws: true,
          Debts: true,
        },
      });

      const total = await this.prisma.restaurant.count({
        where: filter,
      });

      return {
        data: restaurants,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Restaraunt not exists yet');
    }
  }

  async findOne(id: string) {
    try {
      let one = await this.prisma.restaurant.findFirst({
        where: { id },
        include: {
          Products: true,
          Users: true,
          Orders: true,
          Categories: true,
          Withdraws: true,
          Debts: true,
        },
      });
      return one;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: UpdateRestarauntDto) {
    try {
      const existingRestaurant = await this.prisma.restaurant.findUnique({
        where: { id },
      });

      if (!existingRestaurant) {
        throw new BadRequestException('Restaurant not found');
      }

      if (data.regionId) {
        const region = await this.prisma.region.findUnique({
          where: { id: data.regionId },
        });

        if (!region) {
          throw new BadRequestException(
            `Region with id ${data.regionId} not found`,
          );
        }
      }

      if (data.tip !== undefined) {
        data.tip = Number(data.tip);
        if (isNaN(data.tip) || data.tip < 0 || data.tip > 100) {
          throw new BadRequestException(
            'Tip must be a number between 0 and 100',
          );
        }
      }

      const cleanData: any = {};
      if (data.name !== undefined) cleanData.name = data.name;
      if (data.regionId !== undefined) cleanData.regionId = data.regionId;
      if (data.tip !== undefined) cleanData.tip = data.tip;
      if (data.address !== undefined) cleanData.address = data.address;
      if (data.phone !== undefined) cleanData.phone = data.phone;
      if (data.isActive !== undefined) cleanData.isActive = data.isActive;

      let updated = await this.prisma.restaurant.update({
        where: { id },
        data: cleanData,
      });
      return updated;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      let deleted = await this.prisma.restaurant.delete({ where: { id } });
      return deleted;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
