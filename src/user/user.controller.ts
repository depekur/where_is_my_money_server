import { Controller, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from './guards/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('sign-in')
  @Public()
  async anonSignIn(@Request() req) {
    const isUserExist = await this.userService.isUserExists(req.body.deviceId);
    let token: string = '';

    if (isUserExist) {
      const user = await this.userService.getUser(req.body.deviceId);
      token = await this.userService.getJwtToken(user);
    } else {
      const user = await this.userService.createAnonUser(req.body);
      token = await this.userService.getJwtToken(user);
    }

    return {
      token,
    };
  }
}
