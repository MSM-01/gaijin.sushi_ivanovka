import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './db.js';
import { GoPayProvider } from './integrations/gopay.js';
import { Paloma365Adapter } from './integrations/paloma.js';

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? false,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
const gopay = new GoPayProvider();
const paloma = new Paloma365Adapter();

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'gaijin-sushi-api' }));

function detectImageMime(data: Buffer): string | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

app.get('/api/images/:id', async (req, res) => {
  const id = getRouteId(req, res);
  if (!id) return;
  try {
    const image = await prisma.image.findUnique({
      where: { id },
      select: { mimeType: true, data: true },
    });
    if (!image) return res.status(404).json({ error: 'Изображение не найдено.' });
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.end(Buffer.from(image.data));
  } catch (error) {
    console.error('image.get', error);
    res.status(500).json({ error: 'Не удалось загрузить изображение.' });
  }
});

const adminCookie = 'gaijin_admin';
const sessionDays = Math.min(30, Math.max(1, Number(process.env.ADMIN_SESSION_DAYS ?? 7)));
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
});

function readAdminToken(req: express.Request): string | undefined {
  const cookies = req.headers.cookie?.split(';') ?? [];
  const entry = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${adminCookie}=`));
  return entry?.slice(adminCookie.length + 1);
}

function getRouteId(req: express.Request, res: express.Response): string | null {
  const id = req.params.id;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Некорректный идентификатор.' });
    return null;
  }
  return id;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const requireAdmin: express.RequestHandler = async (req, res, next) => {
  const token = readAdminToken(req);
  if (!token) return res.status(401).json({ error: 'Требуется вход администратора.' });
  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { adminId: true, expiresAt: true },
    });
    if (!session || session.expiresAt <= new Date()) {
      return res.status(401).json({ error: 'Сессия истекла. Войдите снова.' });
    }
    res.locals.adminId = session.adminId;
    next();
  } catch (error) {
    console.error('admin.session.lookup', error);
    res.status(500).json({ error: 'Не удалось проверить сессию.' });
  }
};

app.post(
  '/api/admin/images',
  requireAdmin,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '3mb' }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json({ error: 'Поддерживаются только изображения JPEG, PNG и WebP.' });
    }
    const detectedMime = detectImageMime(req.body);
    const declaredMime = req.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    if (!detectedMime || detectedMime !== declaredMime) {
      return res.status(415).json({ error: 'Тип файла не соответствует содержимому изображения.' });
    }

    try {
      const image = await prisma.image.create({
        data: { mimeType: detectedMime, data: Uint8Array.from(req.body) },
        select: { id: true },
      });
      res.status(201).json({ url: `/api/images/${image.id}` });
    } catch (error) {
      console.error('admin.image.create', error);
      res.status(500).json({ error: 'Не удалось сохранить изображение.' });
    }
  },
);

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Укажите логин и пароль.' });
  try {
    const admin = await prisma.adminUser.findUnique({ where: { username: parsed.data.username } });
    const valid = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;
    if (!admin || !valid) return res.status(401).json({ error: 'Неверный логин или пароль.' });

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
    await prisma.adminSession.create({
      data: { adminId: admin.id, tokenHash: hashToken(token), expiresAt },
    });
    res.cookie(adminCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/admin',
      expires: expiresAt,
    });
    res.json({ username: admin.username });
  } catch (error) {
    console.error('admin.login', error);
    res.status(500).json({ error: 'Не удалось выполнить вход.' });
  }
});

app.get('/api/admin/session', requireAdmin, async (_req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: res.locals.adminId as string },
      select: { username: true },
    });
    if (!admin) return res.status(401).json({ error: 'Учетная запись не найдена.' });
    res.json(admin);
  } catch (error) {
    console.error('admin.session', error);
    res.status(500).json({ error: 'Не удалось загрузить сессию.' });
  }
});

app.post('/api/admin/logout', requireAdmin, async (req, res) => {
  const token = readAdminToken(req);
  try {
    if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    res.clearCookie(adminCookie, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/admin' });
    res.status(204).end();
  } catch (error) {
    console.error('admin.logout', error);
    res.status(500).json({ error: 'Не удалось завершить сессию.' });
  }
});

app.get('/api/menu', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { nameRu: 'asc' }],
    });
    const products = await prisma.product.findMany({
      where: { active: true, category: { active: true } },
      orderBy: [{ sortOrder: 'asc' }, { nameRu: 'asc' }],
      include: { category: { select: { externalId: true, id: true } } },
    });
    res.json({
      categories: categories.map((category) => ({
        id: category.externalId ?? category.id,
        name: { ru: category.nameRu, en: category.nameEn, ky: category.nameKy },
      })),
      products: products.map((product) => ({
        id: product.externalId ?? product.id,
        category: product.category.externalId ?? product.category.id,
        name: { ru: product.nameRu, en: product.nameEn, ky: product.nameKy },
        description: { ru: product.descriptionRu, en: product.descriptionEn, ky: product.descriptionKy },
        price: product.priceKgs,
        image: product.imageUrl ?? '',
        available: product.available,
      })),
    });
  } catch (error) {
    console.error('menu.list', error);
    res.status(503).json({ error: 'Меню пока недоступно. Проверьте подключение базы данных.' });
  }
});

const categorySchema = z.object({
  nameRu: z.string().trim().min(1).max(120),
  nameEn: z.string().trim().min(1).max(120),
  nameKy: z.string().trim().max(120).optional().default(''),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
});

const productSchema = z.object({
  categoryId: z.string().min(1),
  nameRu: z.string().trim().min(1).max(160),
  nameEn: z.string().trim().min(1).max(160),
  nameKy: z.string().trim().max(160).optional().default(''),
  descriptionRu: z.string().max(2000),
  descriptionEn: z.string().max(2000),
  descriptionKy: z.string().max(2000).optional().default(''),
  priceKgs: z.number().int().min(1).max(10_000_000),
  imageUrl: z.string().trim().max(1000).nullable(),
  available: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
});

app.get('/api/admin/catalog', requireAdmin, async (_req, res) => {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { nameRu: 'asc' }] }),
      prisma.product.findMany({ include: { category: { select: { nameRu: true } } }, orderBy: [{ sortOrder: 'asc' }, { nameRu: 'asc' }] }),
    ]);
    res.json({ categories, products });
  } catch (error) {
    console.error('admin.catalog.list', error);
    res.status(500).json({ error: 'Не удалось загрузить каталог.' });
  }
});

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте название категории.' });
  try {
    const category = await prisma.category.create({
      data: { ...parsed.data, externalId: `category-${randomBytes(8).toString('hex')}` },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('admin.category.create', error);
    res.status(500).json({ error: 'Не удалось добавить категорию.' });
  }
});

app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  const id = getRouteId(req, res);
  if (!id) return;
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте название категории.' });
  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    res.json(category);
  } catch (error) {
    console.error('admin.category.update', error);
    res.status(404).json({ error: 'Категория не найдена.' });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  const id = getRouteId(req, res);
  if (!id) return;
  try {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) return res.status(409).json({ error: 'Сначала переместите или удалите блюда этой категории.' });
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    console.error('admin.category.delete', error);
    res.status(404).json({ error: 'Категория не найдена.' });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте данные блюда и цену.' });
  try {
    const product = await prisma.product.create({
      data: { ...parsed.data, externalId: `dish-${randomBytes(8).toString('hex')}` },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('admin.product.create', error);
    res.status(400).json({ error: 'Не удалось добавить блюдо. Проверьте категорию.' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const id = getRouteId(req, res);
  if (!id) return;
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте данные блюда и цену.' });
  try {
    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    res.json(product);
  } catch (error) {
    console.error('admin.product.update', error);
    res.status(400).json({ error: 'Не удалось сохранить блюдо. Проверьте категорию.' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const id = getRouteId(req, res);
  if (!id) return;
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    console.error('admin.product.delete', error);
    res.status(404).json({ error: 'Блюдо не найдено.' });
  }
});

// Server-side order creation. Prices are always read from the database, never trusted from the browser.
app.post('/api/orders', async (req, res) => {
  const schema = z.object({
    tableNumber: z.number().int().positive().optional(),
    comment: z.string().max(500).optional().default(''),
    items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).min(1).max(50)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid order', details: parsed.error.flatten() });

  try {
    const ids = parsed.data.items.map(x => x.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true, available: true },
      include: { category: true }
    });
    if (products.length !== new Set(ids).size) return res.status(409).json({ error: 'One or more products are unavailable.' });

    const byId = new Map(products.map(p => [p.id, p]));
    const lines = parsed.data.items.map(item => {
      const p = byId.get(item.productId)!;
      return { productId: p.id, externalProductId: p.externalId, nameRu: p.nameRu, nameEn: p.nameEn,
        quantity: item.quantity, unitPriceKgs: p.priceKgs, lineTotalKgs: p.priceKgs * item.quantity };
    });
    const total = lines.reduce((sum, line) => sum + line.lineTotalKgs, 0);
    const table = parsed.data.tableNumber
      ? await prisma.diningTable.findFirst({ where: { number: parsed.data.tableNumber, active: true } })
      : null;
    if (parsed.data.tableNumber && !table) return res.status(400).json({ error: 'Unknown table.' });

    const order = await prisma.order.create({
      data: {
        publicNumber: `GS-${Date.now().toString(36).toUpperCase()}`,
        tableId: table?.id,
        tableNumber: table?.number,
        customerComment: parsed.data.comment,
        subtotalKgs: total,
        totalKgs: total,
        items: { create: lines }
      },
      include: { items: true }
    });

    // Do not send the order to Paloma365 here. It must wait for verified payment.
    res.status(201).json({ orderId: order.id, orderNumber: order.publicNumber, amountKgs: total, paymentStatus: order.paymentStatus });
  } catch (error) {
    console.error('order.create', error);
    res.status(500).json({ error: 'Could not create order.' });
  }
});

// Payment initialization remains disabled until the provider's official API contract is verified.
app.post('/api/orders/:id/payment', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.paymentStatus === 'PAID') return res.status(409).json({ error: 'Order is already paid.' });
  try {
    const payment = await gopay.createPayment({ orderId: order.id, amountKgs: order.totalKgs, description: order.publicNumber });
    await prisma.order.update({ where: { id: order.id }, data: { paymentProviderId: payment.providerPaymentId } });
    res.json(payment);
  } catch (error) {
    res.status(503).json({ error: error instanceof Error ? error.message : 'Payment provider unavailable.' });
  }
});

// Payment webhook must be connected only after GoPay's exact signature rules are known.
// There is intentionally no unauthenticated "mark paid" endpoint.
app.listen(Number(process.env.PORT ?? 4000), () => {
  console.log(`GAIJIN SUSHI API listening on port ${process.env.PORT ?? 4000}`);
});
