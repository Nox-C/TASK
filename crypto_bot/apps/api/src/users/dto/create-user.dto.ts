import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // optional fields can be added here later
  @IsOptional()
  @IsString()
  extra?: string;
}
