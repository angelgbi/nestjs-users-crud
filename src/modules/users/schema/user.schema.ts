import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export const USERS_COLLECTION = 'users';

@Schema({
  collection: USERS_COLLECTION,
  timestamps: true,
})
export class User {
  @ApiResponseProperty()
  _id: Types.ObjectId;

  @ApiProperty({
    description: `User's birthdate`,
    example: new Date().toISOString(),
    required: true,
  })
  @Prop({ type: Date, required: true })
  birthDate: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({
    description: `User's email address`,
    example: 'johnsmith@nestjs.com',
    required: true,
  })
  @Prop({ unique: true, type: String, required: true })
  email: string;

  @ApiProperty({
    description: `User's first name`,
    example: 'John',
    required: true,
  })
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({
    description: `User's last name`,
    example: 'Smith',
    required: true,
  })
  @Prop({ type: String, required: true })
  lastName: string;

  @ApiProperty({ required: false })
  @Prop({ index: true, type: String })
  marketingSource: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: true })
  phone: string;

  @ApiProperty({
    description: `User's status`,
    example: 'DQL',
    required: false,
  })
  @Prop({ index: true, type: String })
  status: string;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;

  constructor(args?: Partial<User>) {
    Object.assign(this, args);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
