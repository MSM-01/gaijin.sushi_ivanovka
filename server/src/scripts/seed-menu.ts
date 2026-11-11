import 'dotenv/config';
import { CATEGORIES, PRODUCTS } from '../../../src/data/menu.ts';
import { prisma } from '../db.js';

try {
  const categoryIds = new Map<string, string>();
  for (const [index, category] of CATEGORIES.entries()) {
    const saved = await prisma.category.upsert({
      where: { externalId: category.id },
      create: {
        externalId: category.id,
        nameRu: category.name.ru,
        nameEn: category.name.en,
        nameKy: category.name.ky ?? '',
        sortOrder: index,
      },
      update: {},
    });
    // Заполняем кыргызский перевод в уже существующих записях, не трогая заполненные вручную.
    if (category.name.ky) {
      await prisma.category.updateMany({
        where: { externalId: category.id, nameKy: '' },
        data: { nameKy: category.name.ky },
      });
    }
    categoryIds.set(category.id, saved.id);
  }

  for (const [index, product] of PRODUCTS.entries()) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Unknown category "${product.category}" for product "${product.id}".`);
    await prisma.product.upsert({
      where: { externalId: product.id },
      create: {
        externalId: product.id,
        categoryId,
        nameRu: product.name.ru,
        nameEn: product.name.en,
        nameKy: product.name.ky ?? '',
        descriptionRu: product.description.ru,
        descriptionEn: product.description.en,
        descriptionKy: product.description.ky ?? '',
        priceKgs: product.price,
        imageUrl: product.image,
        sortOrder: index,
      },
      update: {},
    });
    if (product.name.ky) {
      await prisma.product.updateMany({
        where: { externalId: product.id, nameKy: '' },
        data: { nameKy: product.name.ky },
      });
    }
    if (product.description.ky) {
      await prisma.product.updateMany({
        where: { externalId: product.id, descriptionKy: '' },
        data: { descriptionKy: product.description.ky },
      });
    }
  }

  console.log(`В каталоге ${CATEGORIES.length} категорий и ${PRODUCTS.length} блюд.`);
} catch (error) {
  console.error('Не удалось загрузить начальное меню в базу данных.', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
