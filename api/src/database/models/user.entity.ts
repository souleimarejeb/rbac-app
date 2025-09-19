import { Column, Entity } from "typeorm";
import { BaseModel } from "./base.model";

@Entity('users')
export class UserEntity extends BaseModel {

    @Column({ type: 'varchar', length: '250', default: 'N/A' })
    name: string;

    @Column({ type: 'varchar', length: '1250', default: 'N/A' })
    last_name: string;

    @Column({ type: 'varchar', length: '1250', unique: true })
    username: string;

    @Column({ type: 'varchar', length: '1250', unique: true })
    password: string;

    @Column({ type: 'varchar', length: '250', unique: true })
    email: string;

    @Column({ type: 'varchar', length: '250' })
    authentication_id: string;

}