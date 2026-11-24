import { Policy, type PolicyBefore } from "@nestjs/authorization";
import { User } from "./entities/user.entity.js";

@Policy()
export class UserPolicy implements PolicyBefore<User> {
    before(user: User | null) {
        if (user?.roles?.some((r) => r.role_name === 'admin')) return true;
    }

    list(_user: User | null) {
        return false;
    }

    assignRoles(_user: User | null) {
        return false;
    }
}