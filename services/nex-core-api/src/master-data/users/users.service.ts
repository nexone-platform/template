import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private hashPassword(plain: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  async findAll(page = 1, limit = 20, search = '') {
    const query = this.usersRepository.createQueryBuilder('user');
    
    if (search) {
      query.where('user.email ILIKE :search OR user.displayName ILIKE :search', { search: `%${search}%` });
    }

    query.orderBy('user.createDate', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();

    data.forEach(user => {
      delete (user as any).password;
    });

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    delete (user as any).password;
    return user;
  }

  async create(createUserDto: any, userId?: string) {
    const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const user = this.usersRepository.create({
      ...createUserDto,
      password: this.hashPassword(createUserDto.password || '123456'),
      createBy: userId || 'system',
    });

    const saved = await this.usersRepository.save(user);
    delete (saved as any).password;
    return saved;
  }

  async update(id: string, updateUserDto: any, userId?: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Only hash password if it is provided and not empty
    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    } else {
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    user.updateBy = userId || 'system';

    const saved = await this.usersRepository.save(user);
    delete (saved as any).password;
    return saved;
  }

  async remove(id: string, userId?: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    user.updateBy = userId || 'system';
    await this.usersRepository.save(user);
    await this.usersRepository.softRemove(user);
    
    return { message: 'User deleted successfully' };
  }
}
