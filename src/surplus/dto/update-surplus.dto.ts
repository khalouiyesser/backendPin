import { PartialType } from '@nestjs/swagger';
import { CreateSurplusDto } from './create-surplus.dto';

export class UpdateSurplusDto extends PartialType(CreateSurplusDto) {}
