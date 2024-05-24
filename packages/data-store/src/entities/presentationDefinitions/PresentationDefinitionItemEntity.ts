import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'

@Entity('PresentationDefinitionItem')
@Index(['version'], { unique: false })
@Index(['version'], { unique: false })
export class PresentationDefinitionItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'definition_id', length: 255, nullable: false, unique: false })
  @IsNotEmpty({ message: 'definitionId field must not be empty' })
  definitionId!: string

  @Column({ name: 'version', length: 255, nullable: false, unique: false })
  @IsNotEmpty({ message: 'version field must not be empty' })
  version!: string

  @Column({ name: 'tenant_id', length: 255, nullable: true, unique: false })
  tenantId?: string

  @Column({ name: 'purpose', length: 255, nullable: true, unique: false })
  purpose?: string

  @Column({ name: 'definition_payload', type: 'text', nullable: false, unique: false })
  @IsNotEmpty({ message: 'definitionPayload field must not be empty' })
  definitionPayload!: string

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt!: Date

  @UpdateDateColumn({ name: 'last_updated_at', nullable: false })
  lastUpdatedAt!: Date

  // By default, @UpdateDateColumn in TypeORM updates the timestamp only when the entity's top-level properties change.
  @BeforeInsert()
  @BeforeUpdate()
  updateUpdatedDate(): void {
    this.lastUpdatedAt = new Date()
  }
}