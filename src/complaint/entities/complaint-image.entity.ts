import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Complaint } from ".";

@Entity()
export class ComplaintImage {
    // @PrimaryGeneratedColumn('uuid')
    // @Column('text')
    @PrimaryColumn('uuid')
    id: string;

    @Column('text')
    url: string;

    @OneToOne(
        () => Complaint,
        (complaint) => complaint.image,
        {onDelete: 'CASCADE'}
    )
    complaint: Complaint;
}