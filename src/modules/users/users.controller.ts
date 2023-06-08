import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';
import { ApiOkResponsePaginated } from 'src/decorators/api-ok-response-paginated.decorator';
import { ParseMongoObjectIdPipe } from 'src/pipes/parse-mongo-object-id.pipe';
import { CsvParser } from 'src/providers/csv-parser.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadUsersResponseDto } from './dto/upload-users-response.dto';
import { UsersInterceptor } from './interceptors/users.interceptor';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';

@ApiTags('Users API')
@Controller('users')
@UseInterceptors(UsersInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  @ApiOperation({
    summary: `Create a new user`,
    description:
      'Endpoint for create a new user. Returns the newly created user.',
  })
  @ApiOkResponse({ type: User, status: 201 })
  async postUsers(@Body() body: CreateUserDto): Promise<User> {
    const newUser = await this.usersService.createUser(body);

    return newUser;
  }

  @Get('/')
  @ApiOperation({
    summary: `Return a list of users`,
    description:
      "Endoint for get the list of users. Can filter, sort and paginate results. Doesn't return soft deleted users.",
  })
  @ApiOkResponsePaginated(User)
  async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedResponseDto<User>> {
    const users = await this.usersService.getAllUsers(query);

    return new PaginatedResponseDto({
      data: users,
      limit: query.limit,
      page: query.page,
      sort: query.sort,
      sortBy: query.sortBy,
    });
  }

  @Patch('/:id')
  @ApiOperation({
    summary: `Update a single user`,
    description:
      'Endpoint to update an user. Returns the user with the updated changes.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async patchUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    const userUpdated = await this.usersService.updateUser(id, body);

    return userUpdated;
  }

  @Delete('/:id')
  @ApiOperation({
    summary: `Soft delete a single user`,
    description:
      'Endpoint to soft delete an user, it just update the isDeleted property to true so user is not indexed on other searchs. Returns the deleted user with the updated property.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  async deleteUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
  ): Promise<User> {
    const userDeleted = await this.usersService.softDeleteUser(id);

    return userDeleted;
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // Allow only CSV mimetypes
      fileFilter: (req, file, callback) => {
        if (!file.mimetype?.match(/text\/csv/i)) {
          return callback(null, false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @ApiOperation({ summary: `Bulk insertion of users to db` })
  @ApiOkResponse({ type: UploadUsersResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: '.csv',
        },
      },
    },
  })
  async uploadUsers(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadUsersResponseDto> {
    if (!file) {
      throw new UnprocessableEntityException(
        'Uploaded file is not a CSV file.',
      );
    }

    const users = await CsvParser.parse(file.path);
    let bulkResults = null;

    try {
      bulkResults = await this.usersService.bulkUserInsertion(users);
    } catch (error) {
      bulkResults = error.result;
    }

    return new UploadUsersResponseDto({
      failedCount: bulkResults.writeErrors
        ? bulkResults.writeErrors.length
        : users.length - bulkResults.insertedCount,
      successCount: bulkResults.insertedCount,
    });
  }
}
