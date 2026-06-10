import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class SetPermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  permissionIds: number[];
}
