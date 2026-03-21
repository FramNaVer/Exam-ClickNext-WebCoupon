require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const rewards = [
        {
            title: 'Coffee Mug',
            description: 'A stylish coffee mug to enjoy your favorite beverage.',
            points_required: 100,
            image_url: 'https://picsum.photos/seed/mug/400/300',
            expiry_date: in90Days,
            redeem_start_date: now,
            redeem_end_date: in30Days,
            terms_condition: 'Valid for one year from the date of redemption. Not refundable or exchangeable.',
            stock: 50,
        },
        {
            title: 'Movie Ticket',
            description: 'Enjoy a free movie ticket at any participating cinema.',
            points_required: 200,
            image_url: 'https://picsum.photos/seed/movie/400/300',
            expiry_date: in60Days,
            redeem_start_date: now,
            redeem_end_date: in30Days,
            terms_condition: 'One ticket per redemption. Valid for standard screening only.',
            stock: 30,
        },
        {
            title: 'Shopping Voucher 500 THB',
            description: 'Get a 500 THB shopping voucher for your next purchase.',
            points_required: 500,
            image_url: 'https://picsum.photos/seed/voucher/400/300',
            expiry_date: in90Days,
            redeem_start_date: now,
            redeem_end_date: in60Days,
            terms_condition: 'Minimum purchase of 1,000 THB required. Cannot be combined with other promotions.',
            stock: 20,
        },
        {
            title: 'Free Pizza',
            description: 'Redeem a free personal-size pizza at participating restaurants.',
            points_required: 300,
            image_url: 'https://picsum.photos/seed/pizza/400/300',
            expiry_date: in30Days,
            redeem_start_date: now,
            redeem_end_date: in30Days,
            terms_condition: 'Valid for dine-in only. Subject to availability.',
            stock: 15,
        },
        {
            title: 'Gym Day Pass',
            description: 'One-day access to our premium fitness center.',
            points_required: 150,
            image_url: 'https://picsum.photos/seed/gym/400/300',
            expiry_date: in60Days,
            redeem_start_date: now,
            redeem_end_date: in60Days,
            terms_condition: 'Valid Monday to Friday only. Bring a valid ID.',
            stock: 40,
        },
    ];

    for (const r of rewards) {
        await prisma.reward.upsert({
            where: { title: r.title },
            update: r,
            create: r,
        });
    }

    console.log('Rewards seeded successfully');

    const users = [
        { username: 'testuser1', password: 'password123', points: 1000 },
        { username: 'testuser2', password: 'password123', points: 250 },
    ];

    for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.upsert({
            where: { username: u.username },
            update: { points: u.points },
            create: { username: u.username, password: hashed, points: u.points },
        });
    }

    console.log('Users seeded successfully');
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
