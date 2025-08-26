import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {
    }
    
    async register(dto: AuthDto) {
        const oldUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

        if (oldUser) {
            throw new BadRequestException('User already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: faker.person.firstName(),
                avatarPath: faker.image.avatar(),
                phone: faker.phone.number(),
                password: await argon2.hash(dto.password)
            }
        })

        const tokens = await this.issueTokens(user.id)

        return { user: this.returnUserFields(user), ...tokens }
    }

    private async issueTokens(userId: string) {
        const data = { id: userId }

        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h'
        })

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        })

        return { accessToken, refreshToken }
    }

    private returnUserFields(user: User) {
        return {
            id: user.id,
            email: user.email,
        }
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken)
        if (!result) {
            throw new UnauthorizedException('Invalid token')
        }

        const user = await this.prisma.user.findUnique({ where: { id: result.id } })
        
        if (!user) {
            throw new NotFoundException('User not found')
        }

        const tokens = await this.issueTokens(user.id)

        return {
            user: this.returnUserFields(user),
            ...tokens
        }
    }

    async login(dto: AuthDto) {
        const user = await this.validateUser(dto)
        const tokens = await this.issueTokens(user.id)

        return {
            user: this.returnUserFields(user),
            ...tokens
        }
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        
        if (!user) {
            throw new NotFoundException('User not found')
        }

        const isValid = await argon2.verify(user.password, dto.password)

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        return user;
    }
}