import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { Theme } from './entities/theme.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('v1/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('active')
  @AuditLog('Themes', 'Get Active Theme')
  async getActiveTheme() {
    const data = await this.themesService.getActiveTheme();
    return { data };
  }

  @Put(':id')
  @AuditLog('Themes', 'Update Theme')
  async updateTheme(@Param('id') id: string, @Body() updateData: Partial<Theme>) {
    const data = await this.themesService.updateTheme(+id, updateData);
    return { data, message: 'Theme updated successfully' };
  }
}
