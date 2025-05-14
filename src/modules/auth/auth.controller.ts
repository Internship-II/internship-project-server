import { Controller, Post, Body, HttpCode, HttpStatus, Get, NotFoundException, Query } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { LoginDto } from "./dto/login.dto"
import { Public } from "./decorators/public.decorator"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      verificationToken: user.verificationToken, // Include token
    };
  }

  @Public() // Bypass authentication guard
  @Get('check-email')
  async checkEmailVerified(@Query('email') email: string) {
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { isEmailVerified: user.isEmailVerified };
  }
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
}
