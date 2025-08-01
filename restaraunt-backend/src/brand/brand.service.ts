import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBrandDto) {
    try {
      const existingBrand = await this.prisma.brand.findFirst({
        where: { name: data.name },
      });

      if (existingBrand) {
        throw new BadRequestException('Bu nom bilan brand mavjud');
      }

      return await this.prisma.brand.create({
        data,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const brands = await this.prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!brands.length) return 'Brandlar mavjud emas!';
      return brands;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException('Brand topilmadi!');
      return brand;
    } catch (error) {
      throw new HttpException(
        'Brandni olishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, data: UpdateBrandDto) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException('Brand topilmadi!');

      if (data.name) {
        const existingBrand = await this.prisma.brand.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (existingBrand) {
          throw new BadRequestException('Bu nom bilan brand mavjud');
        }
      }

      return await this.prisma.brand.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException('Brand topilmadi!');

      await this.prisma.brand.delete({ where: { id } });
      return { message: "Brand muvaffaqiyatli o'chirildi" };
    } catch (error) {
      throw new HttpException(
        "Brandni o'chirishda xatolik yuz berdi",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
