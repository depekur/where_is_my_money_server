import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async isUserExists(deviceId: string) {
    const user = await this.getUser(deviceId);
    return !!user;
  }

  getUser(deviceId: string) {
    return this.userModel.findOne({ deviceId: deviceId });
  }

  async getJwtToken(user: User): Promise<string> {
    const payload = { deviceId: user.deviceId, id: user['_id'].toString() };
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRED_TIME'),
    });
  }

  createAnonUser(authDto: AuthDto) {
    const createdUser = new this.userModel(authDto);
    return createdUser.save();
  }
}
