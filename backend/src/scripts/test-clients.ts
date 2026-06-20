import prisma from '../lib/prisma.js'

async function main() {
  const client = await prisma.client.create({
    data: {
      name: 'Test Cliente',
      email: 'test@test.com',
      status: 'active',
    },
  })
  console.log('Cliente creado:', client)
  await prisma.client.delete({ where: { id: client.id } })
  console.log('Test exitoso — tabla clients funciona correctamente')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
