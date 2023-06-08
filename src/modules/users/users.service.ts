import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { IAppConfig } from 'config/app.config';
import { IMongoConfig } from 'config/mongo.config';
import { BulkWriteResult } from 'mongodb';
import { Model, Types } from 'mongoose';
import { QueryUserDto } from './dto/query-user.dto';
import { rawUserForBulk } from './interfaces/raw.user.interface';
import { User } from './schema/user.schema';
@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService<
      IAppConfig & IMongoConfig,
      true
    >,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  getModel(): Model<User> {
    return this.userModel;
  }

  async getAllUsers(query: QueryUserDto): Promise<User[]> {
    const { sort, sortBy, limit, page, ...filterOptions } = query;
    const offset = limit * (Math.max(0, page) - 1);

    return this.userModel
      .find({
        ...filterOptions,
        isDeleted: false,
      })
      .limit(limit)
      .skip(offset)
      .sort({ [sortBy]: sort });
  }

  async softDeleteUser(id: Types.ObjectId): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      {
        new: true,
      },
    );
  }

  async bulkUserInsertion(users: rawUserForBulk[]): Promise<BulkWriteResult> {
    const userBulk = this.userModel.collection.initializeUnorderedBulkOp();
    const currentDate = new Date().toISOString();

    users.forEach((user) => {
      userBulk.insert({
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
        marketingSource: user.provider,
        birthDate: user.birth_date,
        status: user.status,
        isDeleted: false,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    });

    return userBulk.execute();
  }
}
