import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComplaintImage } from ".";
import { User } from "../../auth/entities/user.entity";
import { Field, ObjectType } from "@nestjs/graphql";

// @ObjectType()
@Entity()
export class Complaint {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field(() => Number)
    @Generated('increment')
    @Column('int', {unique: true})
    no: number;

    @Field(() => String)
    @Column('text')
    description: string;

    @Field(() => String)
    @Column('text')
    problem: string;

    @Field(() => Boolean)
    @Column('boolean', {default: false})
    status: boolean;

    @Field(() => ComplaintImage)
    @OneToOne(
        () => ComplaintImage,
        (complaintImage) =>  complaintImage.complaint,
        {cascade: true, eager: true}
    )
    @JoinColumn()
    image: ComplaintImage;
    
    @Field(() => User)
    @ManyToOne(
        () => User,
        (user) => user.complaint,
        {eager: true}
    )
    user: User;

    @Field(() => Date)
    @Column('date')
    Purchase_date: Date;

    @Field(() => Number)
    @Column('int')
    Invoice_number: number;

    @Field(() => Number)
    @Column('int')
    Cod_prod: number;

    @Field(() => String)
    @CreateDateColumn({
        type: "date",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    created_at: Date;

    @Field(() => Date)
    @UpdateDateColumn({
        type: "date",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)"
    })
    updated_at: Date;

}
