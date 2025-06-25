import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
	const usersData = [
		{
			id: 2,
			email: 'alice@example.com',
			password: 'hashedpassword1',
			username: 'alice123',
			name: 'Alice',
			surname: 'Smith',
			profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
		},
		{	
			id: 3,
			email: 'bob@example.com',
			password: 'hashedpassword2',
			username: 'bobster',
			name: 'Bob',
			surname: 'Johnson',
			profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
		},

	];

	for (const user of usersData) {
		await prisma.user.create({ data: user });
	}
}

main()
	.then(() => {
		console.log('Seed complete');
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});