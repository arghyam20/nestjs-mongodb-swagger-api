import mongoose from 'mongoose';
import { Model, ProjectionFields, Types, UpdateQuery } from 'mongoose';
import mongodb from 'mongodb';

export class BaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(params: Record<string, any>): Promise<T[]> {
    return await this.model.find(params);
  }

  async getAllByField(params: Record<string, any>): Promise<T[]> {
    return await this.model.find(params);
  }

  async getByField(params: Record<string, any>): Promise<T | null> {
    return await this.model.findOne(params);
  }

  async getById(id: Types.ObjectId | string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async getCountByParam(params: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(params);
  }

  async save(body: Partial<T>): Promise<T | null> {
    return await this.model.create(body);
  }

  async updateById(
    data: UpdateQuery<T>,
    id: string | Types.ObjectId,
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async getDistinctDocument(
    field: string,
    params: Record<string, any>,
  ): Promise<unknown[]> {
    return await this.model.distinct(field, params);
  }

  async getAllByFieldWithProjection(
    params: Record<string, any>,
    projection: ProjectionFields<T>,
  ): Promise<T[]> {
    return await this.model.find(params, projection);
  }

  async getByFieldWithProjection(
    params: Record<string, any>,
    projection: ProjectionFields<T>,
  ): Promise<T | null> {
    return await this.model.findOne(params, projection);
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async bulkDelete(params: Record<string, any>): Promise<mongodb.DeleteResult> {
    return await this.model.deleteMany(params);
  }

  async updateByField(
    data: UpdateQuery<T>,
    param: Record<string, any>,
  ): Promise<mongodb.UpdateResult> {
    return await this.model.updateOne(param, data);
  }

  async updateAllByParams(data: UpdateQuery<T>, params: Record<string, any>) {
    return await this.model.updateMany(params, { $set: data });
  }

  async bulkDeleteSoft(
    ids: Types.ObjectId[] | string[],
  ): Promise<mongodb.UpdateResult> {
    return await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } },
    );
  }

  async saveOrUpdate(
    data: UpdateQuery<T>,
    id: string | Types.ObjectId | undefined = undefined,
  ): Promise<T | null> {
    const isExists = await this.model.findById(id);
    if (isExists)
      return await this.model.findByIdAndUpdate(id, data, { new: true });
    return await this.model.create(data);
  }
}
