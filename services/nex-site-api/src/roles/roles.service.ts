import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly permissionRepo: Repository<RolePermission>,
    ) {}

    async findAll(): Promise<Role[]> {
        return this.roleRepo.find({ relations: ['permissions'] });
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    async create(createData: Partial<Role>): Promise<Role> {
        const role = this.roleRepo.create(createData);
        return this.roleRepo.save(role);
    }

    async update(id: string, updateData: Partial<Role>): Promise<Role> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        await this.roleRepo.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        if (role.isSystem) {
            throw new Error(`Cannot delete system role`);
        }
        await this.roleRepo.delete(id);
    }
}
