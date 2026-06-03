import { Role } from '../../../roles/domain/role';

export type JwtPayloadType = {
  id: string;
  role: Role;
  iat: number;
  exp: number;
};
