import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length} from 'class-validator';

export class SignInDto {
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString({ message: 'Username must be a string' })
    @Length(2, 100)
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString({ message: 'password must be a string' })
    @Length(8, 100)
    password: string;
}