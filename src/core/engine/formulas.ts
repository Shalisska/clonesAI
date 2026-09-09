import type { SandboxParams, SandboxResult } from '../domain/types';

/** Выручка = количество × цена за единицу */
export function calcRevenue(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
}

/** Переменные затраты = количество × переменные затраты на единицу */
export function calcVariableCosts(quantity: number, unitCosts: number): number {
    return quantity * unitCosts;
}

/** Суммарные затраты = переменные + постоянные */
export function calcCosts(quantity: number, unitCosts: number, fixedCosts = 0): number {
    return calcVariableCosts(quantity, unitCosts) + fixedCosts;
}

/** Прибыль = выручка − затраты */
export function calcProfit(revenue: number, costs: number): number {
    return revenue - costs;
}

/** Маржа = прибыль / выручка; 0 если выручка нулевая */
export function calcMargin(profit: number, revenue: number): number {
    if (revenue <= 0) return 0;
    return profit / revenue;
}

/** Среднедневной доход за период (дней); 0 при неположительном периоде */
export function calcDailyIncome(profit: number, periodDays: number): number {
    if (periodDays <= 0) return 0;
    return profit / periodDays;
}

/**
 * Окупаемость постоянных затрат в днях.
 * Показывает, сколько дней нужно, чтобы маржинальный доход покрыл
 * постоянные затраты. null, если ежедневная маржинальная прибыль ≤ 0.
 */
export function calcPayback(fixedCosts: number, marginIncomePerDay: number): number | null {
    if (marginIncomePerDay <= 0) return null;
    return fixedCosts / marginIncomePerDay;
}

/**
 * Полный расчёт песочницы по заданным параметрам.
 * Возвращает структурированный результат прогноза.
 */
export function runSandboxCalculation(params: SandboxParams): SandboxResult {
    const quantity = Math.max(0, params.quantity);
    const unitPrice = Math.max(0, params.unitPrice);
    const unitCosts = Math.max(0, params.unitCosts);
    const fixedCosts = Math.max(0, params.fixedCosts ?? 0);
    const periodDays = Math.max(1, params.periodDays ?? 1);

    const revenue = calcRevenue(quantity, unitPrice);
    const costs = calcCosts(quantity, unitCosts, fixedCosts);
    const profit = calcProfit(revenue, costs);
    const margin = calcMargin(profit, revenue);
    const dailyIncome = calcDailyIncome(profit, periodDays);

    // маржинальный доход в день без учёта постоянных затрат
    const variableCosts = calcVariableCosts(quantity, unitCosts);
    const marginIncomePerDay = calcDailyIncome(revenue - variableCosts, periodDays);
    const paybackDays = calcPayback(fixedCosts, marginIncomePerDay);

    return {
        periodDays,
        quantity,
        unitPrice,
        unitCosts,
        fixedCosts,
        revenue,
        costs,
        profit,
        margin,
        dailyIncome,
        paybackDays,
    };
}