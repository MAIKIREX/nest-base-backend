// user.entity.ts

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Profile } from './profile.entity';
import { Role } from '../../../core/auth/models/roles.model';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Identificador unico del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Correo electronico de la cuenta' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
    comment: 'correo electronico de la cuenta',
  })
  email: string;

  @ApiProperty({
    description: 'Contrasena de la cuenta',
    writeOnly: true,
  })
  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'contraseña de la cuenta',
    select: false,
  })
  password: string;

  @ApiProperty({ description: 'Rol de la cuenta', default: Role.USER })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    default: Role.USER,
    comment: 'rol de la cuenta',
  })
  role: string;

  @ApiProperty({ description: 'Fecha de creacion', type: String })
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualizacion', type: String })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @ApiProperty({ type: () => Profile, description: 'Perfil del usuario' })
  @OneToOne(() => Profile, { cascade: true, nullable: false })
  @JoinColumn({ name: 'perfil_id' })
  profile: Profile;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
