import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token_base64url...' })
  @IsString()
  @MinLength(20)
  @MaxLength(400)
  token: string;

  @ApiProperty({ example: 'NuevaClave123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
