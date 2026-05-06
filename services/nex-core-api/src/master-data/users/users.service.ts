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
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.employee', 'employee');
    
    if (search) {
      query.where('user.email ILIKE :search OR user.displayName ILIKE :search OR employee.employeeCode ILIKE :search', { search: `%${search}%` });
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

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanUuid = (val: any) => {
      if (typeof val !== 'string') return null;
      const cleaned = val.trim();
      if (!cleaned || cleaned === '' || !uuidRegex.test(cleaned)) return null;
      return cleaned;
    };

    const user = this.usersRepository.create({
      ...createUserDto,
      roleId: cleanUuid(createUserDto.roleId),
      employeeId: cleanUuid(createUserDto.employeeId),
      password: this.hashPassword(createUserDto.password || '123456'),
      createBy: cleanUuid(userId),
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

    if (updateUserDto.roleId === '' || updateUserDto.roleId === undefined) {
      updateUserDto.roleId = null;
    }

    // List of allowed fields to update to prevent accidental overwrite of sensitive fields
    const allowedFields = ['displayName', 'email', 'roleId', 'isActive', 'language', 'mfaEnabled', 'password', 'employeeId'];
    
    for (const key of Object.keys(updateUserDto)) {
      if (allowedFields.includes(key)) {
        (user as any)[key] = updateUserDto[key];
      }
    }

    // Ensure UUID fields are valid or null (prevent "invalid input syntax for type uuid: ''")
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const cleanUuid = (val: any) => {
      if (typeof val !== 'string') return null;
      const cleaned = val.trim();
      if (!cleaned || cleaned === '' || !uuidRegex.test(cleaned)) return null;
      return cleaned;
    };

    user.roleId = cleanUuid(user.roleId);
    user.employeeId = cleanUuid(user.employeeId);
    user.updateBy = cleanUuid(userId);
    user.createBy = cleanUuid(user.createBy);

    // DEBUG: Throw error to see the state in the UI
    /*
    throw new HttpException({
      status: 500,
      message: 'DEBUGGING UUID ISSUE',
      user_state: {
        roleId: user.roleId,
        employeeId: user.employeeId,
        updateBy: user.updateBy,
        createBy: user.createBy
      }
    }, 500);
    */

    const saved = await this.usersRepository.save(user);
    delete (saved as any).password;
    return saved;
  }

  async remove(id: string, userId?: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    user.updateBy = userId || null;
    await this.usersRepository.save(user);
    await this.usersRepository.softRemove(user);
    
    return { message: 'User deleted successfully' };
  }
}
