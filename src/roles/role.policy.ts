import { Policy, type PolicyBefore } from "@nestjs/authorization";
import { User } from "../users/entities/user.entity.js";

@Policy()
export class RolePolicy implements PolicyBefore<User> {
    before(user: User | null) {
        if (user?.roles?.some((r) => r.role_name === 'admin')) return true;
    }

    create(_user: User | null) {
        return false;
    }

    list(_user: User | null) {
        return false;
    }
}