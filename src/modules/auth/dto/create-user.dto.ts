import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from "class-validator"

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string
  

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string

  @IsNotEmpty()
  @IsString()
  @IsIn(["male", "female", "not_to_say"])
  gender: string

  @IsNotEmpty()
  @IsString()
  @IsIn(["highschool", "university"])
  educationLevel: string

  @IsNotEmpty()
  @IsString()
  province: string
}
