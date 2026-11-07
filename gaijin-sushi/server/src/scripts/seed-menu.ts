import 'dotenv/config';
import { CATEGORIES, PRODUCTS } from '../../../src/data/menu.js';
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
        sortOrder: index,
      },
      update: {},
    });
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
        descriptionRu: product.description.ru,
        descriptionEn: product.description.en,
        priceKgs: product.price,
        imageUrl: product.image,
        sortOrder: index,
      },
      update: {},
    });
  }

  console.log(`В каталоге ${CATEGORIES.length} категорий и ${PRODUCTS.length} блюд.`);
} catch (error) {
  console.error('Не удалось загрузить начальное меню в базу данных.', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
