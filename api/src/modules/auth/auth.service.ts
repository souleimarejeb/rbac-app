import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/database/dtos/user.dto';
import * as argon2 from "argon2";
import { SignInDto } from 'src/database/dtos/sign_in';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) { }

  async signUp(newUser: UserDto): Promise<{ access_token: string }> {


    const password = await argon2.hash(newUser.password);

    await this.usersService.create({ ...newUser, password });

    return this.createAcecessToken(newUser.username);
  }

  async signIn(signInDto:SignInDto): Promise<{ access_token: string }> {

    const user = await this.usersService.findOne(signInDto.username);

    const passwordMatch = await argon2.verify(
      user.password,
      signInDto.password
    )
    if (!passwordMatch) {
      throw new Error("Password doesn't match");
    }
    
    return this.createAcecessToken(user.username)
  }

  createAcecessToken(username: string): { access_token: string } {
    return {
      access_token: this.jwtService.sign({ sub: username })
    };
  }
}
