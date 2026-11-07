import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';

const username = process.env.ADMIN_USERNAME?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!username || !password || password.length < 12) {
  console.error('Укажите ADMIN_USERNAME и ADMIN_PASSWORD (не менее 12 символов) в server/.env.');
  process.exitCode = 1;
} else {
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({ data: { username, passwordHash } });
    console.log(`Администратор "${username}" создан.`);
  } catch (error) {
    console.error('Не удалось создать администратора. Возможно, такой логин уже существует.', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
