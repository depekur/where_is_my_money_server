import { User } from '../../user/schemas/user.schema';

export class CreateCategoryDto {
  name: string;
  user: User;
}
