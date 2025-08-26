// src/common/utils/slug-generator.util.ts
import * as translit from 'translit';

export class SlugGenerator {
  /**
   * Генерирует slug из текста
   * @param text - Исходный текст
   * @param maxLength - Максимальная длина slug (по умолчанию 100)
   * @returns Сгенерированный slug
   */
  static generate(text: string, maxLength: number = 100): string {
    if (!text) return '';

    // Транслитерация кириллицы в латиницу
    const transliterated = translit(text).replace(/[^a-zA-Z0-9\s]/g, '');

    // Преобразование в нижний регистр и замена пробелов на дефисы
    let slug = transliterated
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    // Ограничение длины
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength);
      // Убедимся, что не обрезали на дефисах
      const lastDashIndex = slug.lastIndexOf('-');
      if (lastDashIndex > 0 && lastDashIndex > maxLength - 10) {
        slug = slug.substring(0, lastDashIndex);
      }
    }

    return slug;
  }

  /**
   * Генерирует уникальный slug, проверяя на существование в базе данных
   * @param text - Исходный текст
   * @param checkExistsFn - Функция проверки существования slug
   * @param maxLength - Максимальная длина slug
   * @returns Уникальный slug
   */
  static async generateUnique(
    text: string,
    checkExistsFn: (slug: string) => Promise<boolean>,
    maxLength: number = 100,
  ): Promise<string> {
    let baseSlug = this.generate(text, maxLength);
    let slug = baseSlug;
    let counter = 1;

    // Проверяем, существует ли slug
    while (await checkExistsFn(slug)) {
      // Добавляем суффикс с числом
      const suffix = `-${counter}`;
      
      // Обрезаем baseSlug, чтобы уместить суффикс в maxLength
      const availableLength = maxLength - suffix.length;
      const truncatedBase = baseSlug.substring(0, availableLength);
      
      slug = `${truncatedBase}${suffix}`;
      counter++;
    }

    return slug;
  }
}

export default SlugGenerator;