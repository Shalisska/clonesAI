import type { Block } from './types';
import { Category } from './enums';

/**
 * Начальный каталог игровых экономических блоков «Золотого клона».
 * Собран на основе https://docs.goldenclone.com/ru/.
 * Пользователь может дополнять/править блоки в приложении.
 */
export const DEFAULT_BLOCKS: Block[] = [
    // Животноводство
    { id: 'pigs', name: 'Свиноводство', category: Category.Animals, defaultUnit: 'голова', isActive: true },
    { id: 'peacocks', name: 'Павлины', category: Category.Animals, defaultUnit: 'голова', isActive: true },
    { id: 'dragons', name: 'Драконы', category: Category.Animals, defaultUnit: 'голова', isActive: true },

    // Заводы и фабрики
    { id: 'kvass-factory', name: 'Квасная фабрика', category: Category.Factories, defaultUnit: 'партия', isActive: true },
    { id: 'tannery', name: 'Кожевня', category: Category.Factories, defaultUnit: 'партия', isActive: true },
    { id: 'water-well', name: 'Водокачка', category: Category.Factories, defaultUnit: 'цикл', isActive: true },
    { id: 'oil-derrick', name: 'Нефтяная вышка', category: Category.Factories, defaultUnit: 'цикл', isActive: true },
    { id: 'oil-refinery', name: 'Нефтеперерабатывающий завод', category: Category.Factories, defaultUnit: 'партия', isActive: true },

    // Государственные предприятия (работа на государство)
    { id: 'sawmill', name: 'Лесопилка', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'stone-pit', name: 'Каменоломня', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'iron-mine', name: 'Железный рудник', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'shipyard', name: 'Верфь', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'gristmill', name: 'Мельница', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'meat-processing-plant', name: 'Мясокомбинат', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'metallurgical-workshop', name: 'Металлургическая мастерская', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'alchemical-laboratory', name: 'Алхимическая лаборатория', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },
    { id: 'hospital', name: 'Больница', category: Category.StateEnterprises, defaultUnit: 'смена', isActive: true },

    // Недвижимость
    { id: 'house-rent', name: 'Аренда дома', category: Category.RealEstate, defaultUnit: 'месяц', isActive: true },
    { id: 'settlement', name: 'Поселение', category: Category.RealEstate, defaultUnit: 'месяц', isActive: true },

    // Рентные активы
    { id: 'railway', name: 'Железная дорога', category: Category.Rentier, defaultUnit: 'вагон', isActive: true },
    { id: 'securities', name: 'Ценные бумаги', category: Category.Rentier, defaultUnit: 'пакет', isActive: true },
    { id: 'megalith-mining', name: 'Добыча мегалитов', category: Category.Rentier, defaultUnit: 'цикл', isActive: true },

    // Торговля и биржа
    { id: 'exchange', name: 'Биржа', category: Category.Trade, defaultUnit: 'сделка', isActive: true },
    { id: 'gun-shop', name: 'Оружейная лавка', category: Category.Trade, defaultUnit: 'изделие', isActive: true },
    { id: 'auctions', name: 'Аукционы', category: Category.Trade, defaultUnit: 'лот', isActive: true },
    { id: 'magic-plates', name: 'Магические таблички', category: Category.Trade, defaultUnit: 'изделие', isActive: true },
];