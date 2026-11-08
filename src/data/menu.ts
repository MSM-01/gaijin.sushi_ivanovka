// ============================================================
//  Исходный каталог для первой загрузки в PostgreSQL (`server npm run db:seed`).
//  Текущие блюда и категории редактируются через панель `/admin`.
//  Фото можно хранить в public/menu/ или указывать внешний URL.
//  Цены указаны в кыргызских сомах (KGS).
// ============================================================

export interface L10n {
  ru: string;
  en: string;
}

export interface Category {
  id: string;
  name: L10n;
}

export interface Product {
  id: string;
  category: string;
  name: L10n;
  description: L10n;
  price: number;
  image: string;
  available?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: 'sets', name: { ru: 'Сеты', en: 'Sets' } },
  { id: 'rolls', name: { ru: 'Роллы', en: 'Rolls' } },
  { id: 'baked', name: { ru: 'Запечённые роллы', en: 'Baked rolls' } },
  { id: 'fried', name: { ru: 'Жареные роллы', en: 'Fried rolls' } },
  { id: 'snacks', name: { ru: 'Закуски', en: 'Snacks' } },
  { id: 'pizza', name: { ru: 'Пицца', en: 'Pizza' } },
  { id: 'drinks', name: { ru: 'Прохладительные напитки', en: 'Soft drinks' } },
  { id: 'tea', name: { ru: 'Чай', en: 'Tea' } },
];

const img = (file: string) => `/menu/${file}.jpg`;

export const PRODUCTS: Product[] = [
  // ───────────── СЕТЫ ─────────────
  {
    id: 'filomania',
    category: 'sets',
    name: { ru: 'Филомания', en: 'Philomania' },
    description: {
      ru: 'Ролл Филадельфия, ролл Филадельфия в масаго, ролл Калифорния.',
      en: 'Philadelphia roll, Philadelphia roll with masago, California roll.',
    },
    price: 1099,
    image: img('filomania'),
  },
  {
    id: 'teplaya-vstrecha',
    category: 'sets',
    name: { ru: 'Тёплая встреча', en: 'Warm Meeting' },
    description: {
      ru: 'Запечённые роллы: с тигровой креветкой, Лосось Унаги XL, Запечённый лосось терияки, Румяный XL.',
      en: 'Baked rolls: tiger shrimp, Salmon Unagi XL, Baked Salmon Teriyaki, Rumyany XL.',
    },
    price: 1690,
    image: img('teplaya-vstrecha'),
  },
  {
    id: 'zapechennyi-set',
    category: 'sets',
    name: { ru: 'Запечённый сет', en: 'Baked Set' },
    description: {
      ru: 'Запечённые роллы Лососик Хот с терияки и Крабик Хот, суши Запечённый краб (2 шт.).',
      en: 'Baked rolls Salmon Hot with teriyaki and Crab Hot, plus 2 pcs of Baked Crab sushi.',
    },
    price: 540,
    image: img('zapechennyi-set'),
  },
  {
    id: 'flesh-royal',
    category: 'sets',
    name: { ru: 'Флеш-рояль', en: 'Royal Flush' },
    description: {
      ru: 'Роллы Филадельфия Гурман, Королевская креветка, Филадельфия в масаго; запечённые: Лосось Унаги XL, Тигровая креветка с моцареллой, Румяный XL.',
      en: 'Philadelphia Gourmet, King Shrimp and Philadelphia with masago rolls; baked: Salmon Unagi XL, Tiger Shrimp with mozzarella, Rumyany XL.',
    },
    price: 2350,
    image: img('flesh-royal'),
  },
  {
    id: 'korolevskiy-nabor',
    category: 'sets',
    name: { ru: 'Королевский набор', en: 'Royal Set' },
    description: {
      ru: 'Калифорния с тигровой креветкой, ролл Королевская креветка; запечённые: Лосось терияки, Аяши XL, Крабик Хот.',
      en: 'California with tiger shrimp, King Shrimp roll; baked: Salmon Teriyaki, Ayashi XL, Crab Hot.',
    },
    price: 1750,
    image: img('korolevskiy-nabor'),
  },
  {
    id: 'legkiy-perekus',
    category: 'sets',
    name: { ru: 'Лёгкий перекус набор', en: 'Light Snack Set' },
    description: {
      ru: 'Ролл Калифорния с тигровой креветкой, ролл Калифорния; запечённые: Аяши XL, Сырный XL.',
      en: 'California roll with tiger shrimp, California roll; baked: Ayashi XL, Cheese XL.',
    },
    price: 1470,
    image: img('legkiy-perekus'),
  },

  // ───────────── РОЛЛЫ ─────────────
  {
    id: 'philadelphia',
    category: 'rolls',
    name: { ru: 'Филадельфия', en: 'Philadelphia' },
    description: {
      ru: 'Классический ролл с лососем, сливочным сыром и огурцом.',
      en: 'Classic roll with salmon, cream cheese and cucumber.',
    },
    price: 490,
    image: img('philadelphia'),
  },
  {
    id: 'philadelphia-lite',
    category: 'rolls',
    name: { ru: 'Филадельфия лайт', en: 'Philadelphia Lite' },
    description: {
      ru: 'Облегчённая версия с лососем, нежным сыром и огурцом.',
      en: 'A lighter version with salmon, soft cheese and cucumber.',
    },
    price: 420,
    image: img('philadelphia-lite'),
  },
  {
    id: 'cheese-shrimp-xl',
    category: 'rolls',
    name: { ru: 'Сырная креветка XL', en: 'Cheesy Shrimp XL' },
    description: {
      ru: 'Увеличенная порция с тигровой креветкой и сырной шапкой.',
      en: 'Large portion with tiger shrimp and a cheese cap.',
    },
    price: 470,
    image: img('cheese-shrimp-xl'),
  },
  {
    id: 'veggie-xl',
    category: 'rolls',
    name: { ru: 'Овощной XL', en: 'Veggie XL' },
    description: {
      ru: 'Большой ролл с болгарским перцем, огурцом и авокадо.',
      en: 'Large roll with bell pepper, cucumber and avocado.',
    },
    price: 340,
    image: img('veggie-xl'),
  },
  {
    id: 'salmon-mini',
    category: 'rolls',
    name: { ru: 'Лосось мини ролл', en: 'Salmon Mini Roll' },
    description: {
      ru: 'Традиционный маки-ролл со свежим лососем.',
      en: 'Traditional maki roll with fresh salmon.',
    },
    price: 260,
    image: img('salmon-mini'),
  },
  {
    id: 'cucumber-mini',
    category: 'rolls',
    name: { ru: 'Огурец мини ролл', en: 'Cucumber Mini Roll' },
    description: {
      ru: 'Лёгкий маки-ролл с хрустящим огурцом и кунжутом.',
      en: 'Light maki roll with crunchy cucumber and sesame.',
    },
    price: 110,
    image: img('cucumber-mini'),
  },
  {
    id: 'california',
    category: 'rolls',
    name: { ru: 'Калифорния', en: 'California' },
    description: {
      ru: 'Со снежным крабом, авокадо, огурцом и икрой тобико.',
      en: 'With snow crab, avocado, cucumber and tobiko roe.',
    },
    price: 380,
    image: img('california'),
  },
  {
    id: 'shrimp-cheese',
    category: 'rolls',
    name: { ru: 'Креветка чиз', en: 'Shrimp Cheese' },
    description: {
      ru: 'Ролл с креветкой, сливочным сыром и икрой масаго.',
      en: 'Roll with shrimp, cream cheese and masago roe.',
    },
    price: 420,
    image: img('shrimp-cheese'),
  },
  {
    id: 'california-tiger-shrimp',
    category: 'rolls',
    name: { ru: 'Калифорния с тигровой креветкой', en: 'California with Tiger Shrimp' },
    description: {
      ru: 'Тигровая креветка, авокадо, огурец и икра масаго.',
      en: 'Tiger shrimp, avocado, cucumber and masago roe.',
    },
    price: 420,
    image: img('california-tiger-shrimp'),
  },
  {
    id: 'tiger-shrimp',
    category: 'rolls',
    name: { ru: 'Тигровая креветка', en: 'Tiger Shrimp' },
    description: {
      ru: 'Ролл с тигровой креветкой, сыром и соусом унаги.',
      en: 'Roll with tiger shrimp, cheese and unagi sauce.',
    },
    price: 450,
    image: img('tiger-shrimp'),
  },

  // ───────────── ЗАПЕЧЁННЫЕ РОЛЛЫ ─────────────
  {
    id: 'ayashi-xl',
    category: 'baked',
    name: { ru: 'Аяши XL', en: 'Ayashi XL' },
    description: {
      ru: 'Фирменный запечённый ролл под сочной сырной шапочкой и соусом унаги с кунжутом.',
      en: 'Signature baked roll under a juicy cheese cap with unagi sauce and sesame.',
    },
    price: 350,
    image: img('ayashi-xl'),
  },
  {
    id: 'cheese-xl',
    category: 'baked',
    name: { ru: 'Сырный XL', en: 'Cheese XL' },
    description: {
      ru: 'Нежнейший запечённый ролл с насыщенным сырным кремом и пикантным фирменным соусом.',
      en: 'Delicate baked roll with rich cheese cream and a spicy signature sauce.',
    },
    price: 360,
    image: img('cheese-xl'),
  },
  {
    id: 'salmon-teriyaki',
    category: 'baked',
    name: { ru: 'Лосось терияки', en: 'Salmon Teriyaki' },
    description: {
      ru: 'Ролл с лососем, икрой масаго и запечённой шапочкой в аппетитном соусе терияки.',
      en: 'Roll with salmon, masago roe and a baked cap in tasty teriyaki sauce.',
    },
    price: 380,
    image: img('salmon-teriyaki'),
  },
  {
    id: 'tiger-shrimp-baked',
    category: 'baked',
    name: { ru: 'С тигровой креветкой', en: 'With Tiger Shrimp' },
    description: {
      ru: 'Сочная тигровая креветка под запечённой шапочкой с фирменным соусом унаги и кунжутом.',
      en: 'Juicy tiger shrimp under a baked cap with signature unagi sauce and sesame.',
    },
    price: 380,
    image: img('tiger-shrimp-baked'),
  },
  {
    id: 'salmon-unagi-xl',
    category: 'baked',
    name: { ru: 'Лосось унаги XL', en: 'Salmon Unagi XL' },
    description: {
      ru: 'Запечённый ролл с лососем, обсыпанный миксом кунжута, с добавлением соуса унаги.',
      en: 'Baked salmon roll coated in a sesame mix and topped with unagi sauce.',
    },
    price: 380,
    image: img('salmon-unagi-xl'),
  },
  {
    id: 'chicken-hot',
    category: 'baked',
    name: { ru: 'Цыплёнок хот', en: 'Chicken Hot' },
    description: {
      ru: 'Горячий запечённый ролл со связкой сочного филе цыплёнка и нежной сырной шапочкой.',
      en: 'Hot baked roll with juicy chicken fillet and a delicate cheese cap.',
    },
    price: 220,
    image: img('chicken-hot'),
  },
  {
    id: 'crab-hot',
    category: 'baked',
    name: { ru: 'Крабик хот', en: 'Crab Hot' },
    description: {
      ru: 'Классический горячий маки-ролл с замесом из снежного краба под аппетитной сырной шапочкой.',
      en: 'Classic hot maki roll with snow crab mix under a tasty cheese cap.',
    },
    price: 210,
    image: img('crab-hot'),
  },

  // ───────────── ЖАРЕНЫЕ РОЛЛЫ ─────────────
  {
    id: 'tempura-salmon',
    category: 'fried',
    name: { ru: 'Темпура с лососем', en: 'Salmon Tempura' },
    description: {
      ru: 'Хрустящий темпура-ролл с нежным лососем, огурцом и сливочным сыром в золотистой панировке.',
      en: 'Crispy tempura roll with tender salmon, cucumber and cream cheese in golden breading.',
    },
    price: 400,
    image: img('tempura-salmon'),
  },
  {
    id: 'tempura-shrimp',
    category: 'fried',
    name: { ru: 'Темпура с креветкой', en: 'Shrimp Tempura' },
    description: {
      ru: 'Обжаренный ролл с тигровой креветкой, хрустящим огурцом и мягким сливочным сыром.',
      en: 'Fried roll with tiger shrimp, crunchy cucumber and soft cream cheese.',
    },
    price: 420,
    image: img('tempura-shrimp'),
  },
  {
    id: 'tempura-chicken',
    category: 'fried',
    name: { ru: 'Темпура с курицей', en: 'Chicken Tempura' },
    description: {
      ru: 'Сочное куриное филе, огурец и творожный сыр в обжаренной хрустящей корочке темпура.',
      en: 'Juicy chicken fillet, cucumber and curd cheese in a crispy tempura crust.',
    },
    price: 380,
    image: img('tempura-chicken'),
  },
  {
    id: 'salmon-tempura-prime',
    category: 'fried',
    name: { ru: 'Лосось темпура прайм', en: 'Salmon Tempura Prime' },
    description: {
      ru: 'Премиальный темпура-ролл, щедро украшенный тар-таром из свежего лосося сверху.',
      en: 'Premium tempura roll generously topped with fresh salmon tartare.',
    },
    price: 450,
    image: img('salmon-tempura-prime'),
  },

  // ───────────── ЗАКУСКИ ─────────────
  {
    id: 'fries',
    category: 'snacks',
    name: { ru: 'Картофель фри', en: 'French Fries' },
    description: {
      ru: 'Хрустящие ломтики золотистого картофеля фри, обжаренные до идеальной корочки.',
      en: 'Crispy golden french fries, fried to a perfect crust.',
    },
    price: 180,
    image: img('fries'),
  },
  {
    id: 'nuggets',
    category: 'snacks',
    name: { ru: 'Наггетсы куриные', en: 'Chicken Nuggets' },
    description: {
      ru: 'Сочные кусочки отборного куриного филе в хрустящей золотистой панировке.',
      en: 'Juicy pieces of select chicken fillet in crispy golden breading.',
    },
    price: 220,
    image: img('nuggets'),
  },
  {
    id: 'cheese-sticks',
    category: 'snacks',
    name: { ru: 'Сырные палочки', en: 'Cheese Sticks' },
    description: {
      ru: 'Аппетитные палочки с тянущейся сырной начинкой в обжаренной панировке.',
      en: 'Tasty sticks with stretchy cheese filling in fried breading.',
    },
    price: 250,
    image: img('cheese-sticks'),
  },

  // ───────────── ПИЦЦА ─────────────
  {
    id: 'tom-yam',
    category: 'pizza',
    name: { ru: 'Том-ям', en: 'Tom Yum' },
    description: {
      ru: 'Авторская пицца с креветками, черри, грибами, зеленью и фирменным соусом том-ям.',
      en: 'Signature pizza with shrimp, cherry tomatoes, mushrooms, herbs and tom yum sauce.',
    },
    price: 520,
    image: img('tom-yam'),
  },
  {
    id: 'spicy-chicken-suluguni',
    category: 'pizza',
    name: { ru: 'Пикантный цыплёнок сулугуни', en: 'Spicy Chicken Suluguni' },
    description: {
      ru: 'Сочное филе цыплёнка, шампиньоны и тягучий сыр сулугуни с лёгкой пикантностью.',
      en: 'Juicy chicken fillet, mushrooms and stretchy suluguni cheese with a light spicy kick.',
    },
    price: 460,
    image: img('spicy-chicken-suluguni'),
  },
  {
    id: 'pepperoni',
    category: 'pizza',
    name: { ru: 'Пепперони', en: 'Pepperoni' },
    description: {
      ru: 'Классическая пицца с пикантной колбаской пепперони и двойной моцареллой.',
      en: 'Classic pizza with spicy pepperoni sausage and double mozzarella.',
    },
    price: 460,
    image: img('pepperoni'),
  },
  {
    id: 'julienne',
    category: 'pizza',
    name: { ru: 'Жульен', en: 'Julienne' },
    description: {
      ru: 'Нежное сочетание куриного филе, грибов, лука и сливочно-сырного соуса.',
      en: 'Tender combination of chicken fillet, mushrooms, onion and creamy cheese sauce.',
    },
    price: 480,
    image: img('julienne'),
  },
  {
    id: 'al-sham',
    category: 'pizza',
    name: { ru: 'Аль-шам', en: 'Al-Sham' },
    description: {
      ru: 'Сытная пицца со свежими овощами, курицей и фирменным двойным соусом.',
      en: 'Hearty pizza with fresh vegetables, chicken and a signature double sauce.',
    },
    price: 440,
    image: img('al-sham'),
  },
  {
    id: 'four-cheese',
    category: 'pizza',
    name: { ru: '4 сыра', en: '4 Cheese' },
    description: {
      ru: 'Изысканный микс четырёх видов сыра на нежном сливочном соусе.',
      en: 'Refined mix of four cheeses on a delicate cream sauce.',
    },
    price: 470,
    image: img('four-cheese'),
  },
  {
    id: 'margherita',
    category: 'pizza',
    name: { ru: 'Маргарита', en: 'Margherita' },
    description: {
      ru: 'Традиционная итальянская пицца с томатным соусом, моцареллой и орегано.',
      en: 'Traditional Italian pizza with tomato sauce, mozzarella and oregano.',
    },
    price: 410,
    image: img('margherita'),
  },

  // ───────────── ПРОХЛАДИТЕЛЬНЫЕ НАПИТКИ ─────────────
  {
    id: 'dada-juice',
    category: 'drinks',
    name: { ru: 'Сок Dada (1 л)', en: 'Dada Juice (1 L)' },
    description: { ru: 'Яблочный сок, 1 литр.', en: 'Apple juice, 1 litre.' },
    price: 140,
    image: img('dada-juice'),
  },
  {
    id: 'piko-juice',
    category: 'drinks',
    name: { ru: 'Сок Piko (1 л)', en: 'Piko Juice (1 L)' },
    description: { ru: 'Апельсиновый сок Piko Pulpy, 1 литр.', en: 'Piko Pulpy orange juice, 1 litre.' },
    price: 140,
    image: img('piko-juice'),
  },
  {
    id: 'fuse-tea',
    category: 'drinks',
    name: { ru: 'Fuse Tea (1 л)', en: 'Fuse Tea (1 L)' },
    description: { ru: 'Холодный чай со вкусом манго и ромашки, 1 литр.', en: 'Iced tea with mango and chamomile flavour, 1 litre.' },
    price: 140,
    image: img('fuse-tea'),
  },
  {
    id: 'coca-cola',
    category: 'drinks',
    name: { ru: 'Coca-Cola (1 л)', en: 'Coca-Cola (1 L)' },
    description: { ru: 'Газированный напиток, 1 литр.', en: 'Carbonated soft drink, 1 litre.' },
    price: 120,
    image: img('coca-cola'),
  },
  {
    id: 'fanta',
    category: 'drinks',
    name: { ru: 'Fanta (1 л)', en: 'Fanta (1 L)' },
    description: { ru: 'Газированный напиток, 1 литр.', en: 'Carbonated soft drink, 1 litre.' },
    price: 120,
    image: img('fanta'),
  },
  {
    id: 'sprite',
    category: 'drinks',
    name: { ru: 'Sprite (1 л)', en: 'Sprite (1 L)' },
    description: { ru: 'Газированный напиток, 1 литр.', en: 'Carbonated soft drink, 1 litre.' },
    price: 120,
    image: img('sprite'),
  },
  {
    id: 'coca-cola-can',
    category: 'drinks',
    name: { ru: 'Coca-Cola (железная банка)', en: 'Coca-Cola (can)' },
    description: { ru: 'Газированный напиток в железной банке.', en: 'Carbonated soft drink in a can.' },
    price: 100,
    image: img('coca-cola-can'),
  },
  {
    id: 'pepsi',
    category: 'drinks',
    name: { ru: 'Pepsi (1 л)', en: 'Pepsi (1 L)' },
    description: { ru: 'Газированный напиток, 1 литр.', en: 'Carbonated soft drink, 1 litre.' },
    price: 120,
    image: img('pepsi'),
  },
  {
    id: 'asu',
    category: 'drinks',
    name: { ru: 'ASU (1 л)', en: 'ASU (1 L)' },
    description: { ru: 'Негазированный напиток ASU, в ассортименте, 1 литр.', en: 'Still ASU drink, various flavours available, 1 litre.' },
    price: 85,
    image: img('asu'),
  },

  // ───────────── ЧАЙ ─────────────
  {
    id: 'tea-tashkent',
    category: 'tea',
    name: { ru: 'Ташкентский чай', en: 'Tashkent Tea' },
    description: { ru: 'Чай в чайнике.', en: 'Tea served in a teapot.' },
    price: 200,
    image: img('tea-tashkent'),
  },
  {
    id: 'tea-black',
    category: 'tea',
    name: { ru: 'Чёрный чай', en: 'Black Tea' },
    description: { ru: 'Чай в чайнике.', en: 'Tea served in a teapot.' },
    price: 140,
    image: img('tea-black'),
  },
  {
    id: 'tea-green',
    category: 'tea',
    name: { ru: 'Зелёный чай', en: 'Green Tea' },
    description: { ru: 'Чай в чайнике.', en: 'Tea served in a teapot.' },
    price: 200,
    image: img('tea-green'),
  },
  {
    id: 'tea-berry',
    category: 'tea',
    name: { ru: 'Ягодный чай', en: 'Berry Tea' },
    description: { ru: 'Чай в чайнике.', en: 'Tea served in a teapot.' },
    price: 200,
    image: img('tea-berry'),
  },
];

const BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export const getProduct = (id: string): Product | undefined => BY_ID[id];
