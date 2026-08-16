import {
  Controller,
  Get,
  UseGuards,
  Version,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UserGroup } from 'src/common/decorator/user-group.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { LoginUser } from 'src/common/decorator/login-user.decorator';
import { CategoryApiService } from './category.api.service';

@ApiTags('Category')
@Controller('category')
export class CategoryApiController {
  constructor(private readonly categoryService: CategoryApiService) {}

  @Version('1')
  @Get('list')
  @ApiOperation({ summary: 'Get all active categories for form initiation' })
  @UserGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: String,
    description: 'Parent category ID',
  })
  async getList(
    @LoginUser() user: Partial<UserDocument>,
    @Query('parentId') parentId?: string,
  ) {
    return this.categoryService.list(user, parentId);
  }
}
