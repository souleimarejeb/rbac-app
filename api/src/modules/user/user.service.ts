
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/database/models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from '../../database/dtos/user.dto';
import { UpadteUserDto } from '../../database/dtos/user.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }

    async create(payload: UserDto): Promise<UserDto> {
        try {
            const newUser = this.userRepository.create({
                ...payload
            })
            return await this.userRepository.save(newUser)
        } catch (error) {
            throw error;
        }
    }

    async getAll(): Promise<UserDto[]> {
        try {
            return await this.userRepository.find();
        } catch (error) {
            throw error
        }
    }
     async findOne(username: string): Promise<UserDto> {
        try {
            const user = await this.userRepository.findOne({ where: { username } });
            if (!user) {
                throw new NotFoundException(`User with username ${username} not found`)
            };
            return user;
        } catch (error) {
            throw error
        }
    }

    async getOne(id: string): Promise<UserDto> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`)
            };
            return user;
        } catch (error) {
            throw error
        }
    }

    async update(id: string, payload: UpadteUserDto) {
        try {
            const user = await this.getOne(id);
            Object.assign(user, payload)
            return await this.userRepository.save(user)
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const user = await this.getOne(id);
            await this.userRepository.softDelete(id);
            return { deleted: true };
            
        } catch (error) {
            throw error;
        }
    }
}
