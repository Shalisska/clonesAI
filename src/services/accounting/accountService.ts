import type { Server } from '../../core/domain/enums';
import type { Account, User } from '../../core/domain/types';
import { generateId } from '../../data/repositories/repository.interface';
import type { Repository } from '../../data/repositories/repository.interface';

/** Входные данные для создания аккаунта. */
export interface AccountInput {
    userId: string;
    server: Server;
    name: string;
    notes?: string;
}

/** Сервис управления пользователями и их игровыми аккаунтами. */
export class AccountService {
    private readonly usersRepo: Repository<User>;
    private readonly accountsRepo: Repository<Account>;

    constructor(
        usersRepo: Repository<User>,
        accountsRepo: Repository<Account>,
    ) {
        this.usersRepo = usersRepo;
        this.accountsRepo = accountsRepo;
    }

    // ---- Пользователи ----
    getUsers(): User[] {
        return [...this.usersRepo.getAll()].sort((a, b) => a.name.localeCompare(b.name));
    }

    addUser(name: string): User {
        const user: User = {
            id: generateId('user'),
            name: name.trim(),
            createdAt: new Date().toISOString(),
        };
        this.usersRepo.add(user);
        return user;
    }

    removeUser(id: string): void {
        for (const account of this.accountsRepo.getAll().filter((a) => a.userId === id)) {
            this.accountsRepo.remove(account.id);
        }
        this.usersRepo.remove(id);
    }

    // ---- Аккаунты ----
    getAccounts(): Account[] {
        return [...this.accountsRepo.getAll()].sort((a, b) =>
            a.server.localeCompare(b.server) || a.name.localeCompare(b.name),
        );
    }

    getAccountsByUser(userId: string): Account[] {
        return this.getAccounts().filter((a) => a.userId === userId);
    }

    getById(id: string): Account | undefined {
        return this.accountsRepo.getById(id);
    }

    addAccount(input: AccountInput): Account {
        const account: Account = {
            id: generateId('account'),
            userId: input.userId,
            server: input.server,
            name: input.name.trim(),
            notes: input.notes?.trim() || undefined,
            createdAt: new Date().toISOString(),
        };
        this.accountsRepo.add(account);
        return account;
    }

    updateAccount(account: Account): void {
        this.accountsRepo.update(account);
    }

    removeAccount(id: string): void {
        this.accountsRepo.remove(id);
    }
}