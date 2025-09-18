import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 *  @description
 * this entity is used to hold the base properties for all entities
 *  such as id, createdAt, updatedAt, deletedAt
 */
export abstract class BaseModel {
    @PrimaryGeneratedColumn()
    id:string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}