import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';

@Module({
   imports: [
    UserModule,
    JwtModule.registerAsync({
      global: true,
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
        secret: config.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '60s' },
      }),
      
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
