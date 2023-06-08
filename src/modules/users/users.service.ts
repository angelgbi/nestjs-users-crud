import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { IAppConfig } from 'config/app.config';
import { IMongoConfig } from 'config/mongo.config';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
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

  async bulkUserInsertion(users: rawUserForBulk[]): Promise<BulkWriteResult> {
    const userBulk = this.userModel.collection.initializeUnorderedBulkOp();

    users.forEach((user) => {
      userBulk.insert({
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
        marketingSource: user.provider,
        birthDate: user.birth_date,
        status: user.status,
      });
    });

    return userBulk.execute();
  }
}
