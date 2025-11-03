import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@prisma/client';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit() {
    await this.createTestData();
  }

  async register(data: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Bu telefon raqam bilan foydalanuvchi mavjud',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData = {
      ...data,
      password: hashedPassword,
      regionId:
        data.regionId && data.regionId.trim() !== '' ? data.regionId : null,
      restaurantId:
        data.restaurantId && data.restaurantId.trim() !== ''
          ? data.restaurantId
          : null,
    };

    const user = await this.prisma.user.create({
      data: userData,
    });

    const { access_token, refresh_token } = await this.generateTokens(user);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        balans: user.balans,
        regionId: user.regionId,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
      },
    };
  }

  async createTestData() {
    const regionCount = await this.prisma.region.count();
    if (regionCount === 0) {
      await this.prisma.region.createMany({
        data: [
          { name: 'Toshkent' },
          { name: 'Samarqand' },
          { name: 'Buxoro' },
          { name: 'Andijon' },
          { name: "Farg'ona" },
        ],
      });
      console.log('Test regions created');
    }

    const restaurantCount = await this.prisma.restaurant.count();
    if (restaurantCount === 0) {
      const regions = await this.prisma.region.findMany();
      if (regions.length > 0) {
        await this.prisma.restaurant.createMany({
          data: [
            {
              name: 'Restoran 1',
              tip: 10,
              address: 'Toshkent shahri',
              phone: '+998901234567',
              regionId: regions[0].id,
            },
            {
              name: 'Restoran 2',
              tip: 15,
              address: 'Samarqand shahri',
              phone: '+998901234568',
              regionId: regions[1]?.id || regions[0].id,
            },
            {
              name: 'Restoran 3',
              tip: 12,
              address: 'Buxoro shahri',
              phone: '+998901234569',
              regionId: regions[2]?.id || regions[0].id,
            },
          ],
        });
        console.log('Test restaurants created');
      }
    }

    const userCount = await this.prisma.user.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const regions = await this.prisma.region.findFirst();
      const restaurants = await this.prisma.restaurant.findFirst();

      await this.prisma.user.create({
        data: {
          name: 'admin',
          phone: '+998901234567',
          password: hashedPassword,
          role: 'ADMIN',
          regionId: regions?.id,
          restaurantId: restaurants?.id,
        },
      });

      console.log('Test user created: admin / 123456');
    }
  }

  async generateTokens(user: any) {
    const payload = { id: user.id, role: user.role };

    const access_token = this.jwt.sign(payload, {
      secret: 'accessSecret',
      expiresIn: '1d',
    });

    const refresh_token = this.jwt.sign(payload, {
      secret: 'refreshSecret',
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }

  async login(data: LoginUserDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: data.phone },
      });

      if (!user) {
        throw new BadRequestException('User not found!');
      }

      const match = await bcrypt.compare(data.password, user.password);
      if (!match) {
        throw new BadRequestException('Wrong credentials!');
      }

      const { access_token, refresh_token } = await this.generateTokens(user);

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          balans: user.balans,
          regionId: user.regionId,
          restaurantId: user.restaurantId,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      throw new HttpException(
        'User login qilishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: {
    name?: string;
    phone?: string;
    restaurantId?: string;
    regionId?: string;
    role?: 'ADMIN' | 'SUPER_ADMIN' | 'CASHER' | 'WAITER';
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  }) {
    try {
      const {
        name,
        restaurantId,
        phone,
        regionId,
        role,
        page = 1,
        limit = 10,
        sort = 'asc',
      } = query;

      const skip = (page - 1) * limit;

      const users = await this.prisma.user.findMany({
        where: {
          name: name ? { contains: name, mode: 'insensitive' } : undefined,
          phone: phone ? { contains: phone, mode: 'insensitive' } : undefined,
          restaurantId: restaurantId ? restaurantId : undefined,
          regionId: regionId ? String(regionId) : undefined,
          role: role ? role : undefined,
        },
        orderBy: {
          name: sort,
        },
        include: {
          Region: true,
        },
        skip,
        take: Number(limit),
      });

      if (!users.length) return "Users aren't exists yet!";
      return users;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User topilmadi!');
      return user;
    } catch (error) {
      throw new HttpException(
        'Userni olishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, data: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findFirst({ where: { id } });
      if (!user) throw new NotFoundException('User topilmadi!');

      if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRoleToAdmin(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User topilmadi!');

      return await this.prisma.user.update({
        where: { id },
        data: { role: 'ADMIN' },
      });
    } catch (error) {
      throw new HttpException(
        'Role ni ADMIN ga o‘zgartirishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshAccessToken(refresh_token: string) {
    try {
      const payload = this.jwt.verify(refresh_token, {
        secret: 'refreshSecret',
      });

      const access_token = this.jwt.sign(payload, {
        secret: 'accessSecret',
        expiresIn: '1d',
      });

      return access_token;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User topilmadi!');

      await this.prisma.user.delete({ where: { id } });
      return { message: 'User muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      throw new HttpException(
        'Userni o‘chirishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
