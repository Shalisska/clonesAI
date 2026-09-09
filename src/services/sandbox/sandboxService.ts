import type { PriceQuote, SandboxParams, SandboxResult } from '../../core/domain/types';
import { runSandboxCalculation } from '../../core/engine/formulas';

/** Сервис песочницы: прогноз прибыльности по заданным параметрам. */
export class SandboxService {
    private readonly getQuote: (itemId: string) => PriceQuote | undefined;

    /**
     * @param getQuote функция получения последней котировки по itemId
     */
    constructor(getQuote: (itemId: string) => PriceQuote | undefined) {
        this.getQuote = getQuote;
    }

    simulate(params: SandboxParams): SandboxResult {
        let unitPrice = params.unitPrice;
        if (params.useQuoteForPrice && params.quoteItemId) {
            const quote = this.getQuote(params.quoteItemId);
            if (quote) unitPrice = quote.price;
        }
        return runSandboxCalculation({ ...params, unitPrice });
    }

    /** Проброс чистого расчёта без зависимости от котировок. */
    simulateRaw(params: SandboxParams): SandboxResult {
        return runSandboxCalculation(params);
    }
}