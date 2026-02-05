import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { ownersTable } from '../db/schema';
import { Owner } from './schemas/owner.schema';
import { CreateOwnerInput } from './dtos/create-owner.input';

@Injectable()
export class OwnersService {
  constructor(
    @Inject('DB_DEV')
    private drizzleDev: PostgresJsDatabase<typeof schema>,
  ) {}

  async getAllOwners(): Promise<Owner[]> {
    const owners = await this.drizzleDev.select().from(ownersTable);
    return owners as Owner[];
  }

  async getOwnerById(id: string): Promise<Owner | null> {
    const owners = await this.drizzleDev
      .select()
      .from(ownersTable)
      .where(eq(ownersTable.id, id));
    return (owners[0] as Owner) || null;
  }

  async getOwnerByEmail(email: string): Promise<Owner | null> {
    const owners = await this.drizzleDev
      .select()
      .from(ownersTable)
      .where(eq(ownersTable.email, email));
    return (owners[0] as Owner) || null;
  }

  async createOwner(ownerData: CreateOwnerInput): Promise<Owner> {
    const result = await this.drizzleDev
      .insert(ownersTable)
      .values(ownerData)
      .returning();

    return result[0] as Owner;
  }
}
