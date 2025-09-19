import { ApiProperty ,PartialType} from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length} from 'class-validator';

export class UserDto {

    @ApiProperty()
    @IsString({ message: 'Name must be a string' })
    @Length(2, 100)
    @IsOptional()
    name: string;

    @ApiProperty()
    @Length(2, 100)
    @IsString({ message: 'LastName must be a string' })
    @IsOptional()
    last_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString({ message: 'Username must be a string' })
    @Length(2, 100)
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString({ message: 'Username must be a string' })
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email address' })
    @Length(10, 255, { message: 'Email must be between 10 and 255 characters long ' })
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    authentication_id: string;
}

export class UpadteUserDto extends PartialType(UserDto)  {
}