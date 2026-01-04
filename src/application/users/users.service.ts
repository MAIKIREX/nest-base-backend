import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../../core/auth/models/roles.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      relations: ['profile'],
    });
  }

  async getUserById(id: string) {
    const user = await this.findOne(id);
    return user;
  }

  async getProfileByUserId(id: string) {
    const user = await this.findOne(id);
    return user.profile;
  }

  async create(body: CreateUserDto, currentUser?: User) {
    try {
      const userToCreate = { ...body };

      // Asignación de rol
      if (currentUser && currentUser.role === Role.ADMIN && userToCreate.role) {
        // admin puede asignar rol
      } else {
        userToCreate.role = Role.USER;
      }

      const newUser = this.usersRepository.create(userToCreate);
      const savedUser = await this.usersRepository.save(newUser);

      return this.findOne(savedUser.id);
    } catch {
      throw new BadRequestException('Error creating user');
    }
  }

  async update(id: string, changes: UpdateUserDto) {
    try {
      const user = await this.findOne(id);

      const updates: UpdateUserDto & { passwordChangedAt?: Date } = {
        ...changes,
      };

      if (changes.password) {
        updates.password = await bcrypt.hash(changes.password, 10);

        // ✅ NUEVO: marca cuándo se cambió la contraseña
        updates.passwordChangedAt = new Date();
      }

      const updatedUser = this.usersRepository.merge(user, updates);
      const saved = await this.usersRepository.save(updatedUser);

      return saved;
    } catch {
      throw new BadRequestException('Error updating user');
    }
  }

  async delete(id: string) {
    try {
      await this.usersRepository.delete(id);
      return { message: 'User deleted' };
    } catch {
      throw new BadRequestException('Error deleting user');
    }
  }

  private async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }
}
