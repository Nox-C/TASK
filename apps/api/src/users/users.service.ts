import { Injectable } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hash,
      },
    });

    // Do not return passwordHash
    // Return a minimal user view
    // (Controllers can shape the response further)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validatePassword(email: string, plain: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(plain, user.passwordHash);
    return ok ? user : null;
  }
}
