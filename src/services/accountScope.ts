/**
 * Хранит ссылку на выбранный в данный момент аккаунт.
 * Сервисы читают его лениво внутри методов, поэтому смена аккаунта
 * не требует пересоздания сервисов — достаточно обновить scope.
 */
export class ActiveAccountScope {
    private accountId: string | null = null;

    set(accountId: string | null): void {
        this.accountId = accountId;
    }

    get(): string | null {
        return this.accountId;
    }
}