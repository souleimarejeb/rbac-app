import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Public } from 'src/common/decorators/SetMetadata.decorator';
import { UserDto } from 'src/database/dtos/user.dto';
import { SignInDto } from 'src/database/dtos/sign_in';

@ApiTags('AUTH MGMT')
@Controller({ version: '1', path: 'auth' })
export class AuthController {

    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('SignUp')
    @ApiBody({type:UserDto})
    signUp(@Body() signUpDto: UserDto) {
        return this.authService.signUp(signUpDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({})
    signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}
