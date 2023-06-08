import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
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

  @ApiPropertyOptional()
  @Prop({ type: Date, default: Date.now })
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

  @ApiPropertyOptional({
    example: false,
  })
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({
    description: `User's last name`,
    example: 'Smith',
    required: true,
  })
  @Prop({ type: String, required: true })
  lastName: string;

  @ApiPropertyOptional({
    description: `User information provider`,
    example: 'Facebook',
  })
  @Prop({ index: true, type: String })
  marketingSource: string;

  @ApiProperty({
    description: `User's phone`,
    example: '(000) 000-0000',
    required: true,
  })
  @Prop({ type: String, required: true })
  phone: string;

  @ApiPropertyOptional({
    description: `User's status`,
    example: 'DQL',
  })
  @Prop({ index: true, type: String })
  status: string;

  @ApiPropertyOptional()
  @ApiResponseProperty()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  constructor(args?: Partial<User>) {
    Object.assign(this, args);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
