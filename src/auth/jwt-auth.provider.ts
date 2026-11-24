import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from "@nestjs/authentication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity.js";

@Injectable()
  export class JwtAuth extends JwtBearerProvider<User> {
    constructor(
      @InjectRepository(User) private readonly users: Repository<User>,
      registry: AuthenticationRegistry,
    ) {
      super();
      registry.registerProvider(this);
    }

    validate({ sub }: JwtClaims) {
      return sub
        ? this.users.findOne({ where: { id: sub }, relations: { roles: true } })
        : null;
    }
  }