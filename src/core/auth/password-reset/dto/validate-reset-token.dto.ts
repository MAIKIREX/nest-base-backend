import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ValidateResetTokenDto {
  @ApiProperty({ example: 'token_base64url...' })
  @IsString()
  @MinLength(20)
  @MaxLength(400)
  token: string;
}
