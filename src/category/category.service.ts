import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdWallet = new this.categoryModel(createCategoryDto);
    return createdWallet.save();
  }

  findAll(userId: string) {
    return this.categoryModel.find({ user: userId });
  }

  findOne(id: string) {
    return this.categoryModel.findOne({_id: id});
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {new: true});
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
