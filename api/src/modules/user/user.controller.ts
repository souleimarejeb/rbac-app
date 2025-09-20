import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserDto } from '../../database/dtos/user.dto';
import { UpadteUserDto } from '../../database/dtos/user.dto';


@ApiTags('USERS MGMT')
@Controller({ version: '1', path: 'users' })
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiBody({ type: UserDto })
    create(@Body() payload:UserDto): Promise<UserDto> {

        return this.userService.create(payload);
    }

    @Get(':id')
    getOne(@Param('id') id: string,) {
        return this.userService.getOne(id);
    }

    @Get('/username/:username')
    findOne(@Param('username') username : string) {
        return this.userService.findOne(username);
    }

    @Get()
    getAll() {
        return this.userService.getAll();
    }

    @Put(':id')
    @ApiBody({ type: UpadteUserDto })
    update(
        @Body() payload: UpadteUserDto,
        @Param('id') id: string
    ) {
        return this.userService.update(id, payload);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.userService.delete(id);
    }

}
