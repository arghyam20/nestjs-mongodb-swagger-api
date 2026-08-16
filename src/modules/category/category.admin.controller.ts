import 'multer';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Version,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoryAdminService } from './category.admin.service';
import { AuthGuard } from '@nestjs/passport';
import {
  CategoryListingDto,
  SaveCategoryDto,
  StatusCategoryDto,
  UpdateCategoryDto,
} from 'src/modules/category/dto/category.dto';
import { SingleFileInterceptor } from 'src/common/interceptors/files.interceptor';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { Permission } from 'src/common/decorator/permissions.decorator';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';
import { PermissionAction } from 'src/common/enum/permission-action.enum';
import { LoginUser } from 'src/common/decorator/login-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Admin Category')
@Controller('admin/category')
export class CategoryAdminController {
  constructor(private categoryService: CategoryAdminService) {}

  @Version('1')
  @Post('getall')
  @Permission('category', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllCategory(@Body() dto: CategoryListingDto) {
    return this.categoryService.getAll(dto);
  }

  @Version('1')
  @Post('save')
  @Permission('category', PermissionAction.WRITE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('category', 'icon'))
  async saveCategory(
    @Body() dto: SaveCategoryDto,
    @UploadedFiles() files: any[],
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.categoryService.save(dto, files, user);
  }

  @Version('1')
  @Get('get/:id')
  @Permission('category', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getCategory(@Param('id') id: string) {
    return this.categoryService.get(id);
  }

  @Version('1')
  @Post('update')
  @Permission('category', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('category', 'icon'))
  async updateCategory(
    @Body() dto: UpdateCategoryDto,
    @UploadedFiles() files: any[],
  ) {
    return this.categoryService.update(dto, files);
  }

  @Version('1')
  @Post('status-change')
  @Permission('category', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async statusChange(@Body() dto: StatusCategoryDto) {
    return this.categoryService.statusUpdate(dto);
  }

  @Version('1')
  @Get('delete/:id')
  @Permission('category', PermissionAction.DELETE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Version('1')
  @Get('list')
  @AdminGroup()
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
  @ApiQuery({
    name: 'assign',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by assignment status',
  })
  async getList(
    @LoginUser() user: Partial<UserDocument>,
    @Query('parentId') parentId?: string,
    @Query('assign') assign?: string,
  ) {
    return this.categoryService.list(user, parentId, assign);
  }
}
