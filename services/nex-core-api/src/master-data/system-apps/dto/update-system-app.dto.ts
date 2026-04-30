import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemAppDto } from './create-system-app.dto';

export class UpdateSystemAppDto extends PartialType(CreateSystemAppDto) {}
