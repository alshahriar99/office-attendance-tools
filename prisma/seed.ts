import { PrismaClient } from '@prisma/client'
import { auth } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@example.com'
  const employees = [
    'employee1@example.com',
    'employee2@example.com',
    'employee3@example.com',
    'employee4@example.com',
    'employee5@example.com'
  ]

  console.log('Seeding database...')

  // Cleanup existing accounts, sessions, and users
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  
  // Create Admin
  const adminRes = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: 'Password123!',
      name: 'Admin User'
    }
  });
  
  // Set role to ADMIN for the admin user manually since signUpEmail defaults to user/employee
  if (adminRes && adminRes.user) {
    await prisma.user.update({
      where: { id: adminRes.user.id },
      data: { role: 'ADMIN' }
    });
    console.log(`Created admin: ${adminEmail}`)
  }

  // Create Employees
  for (const empEmail of employees) {
    const empRes = await auth.api.signUpEmail({
      body: {
        email: empEmail,
        password: 'Password123!',
        name: `Employee ${empEmail.charAt(8)}`
      }
    });
    if (empRes && empRes.user) {
      console.log(`Created employee: ${empEmail}`)
    }
  }

  // Create default settings
  await prisma.settings.deleteMany()
  await prisma.settings.create({
    data: {
      companyName: 'Acme Corp',
      officeStartTime: '09:00',
      officeEndTime: '18:00',
      lateThreshold: 15,
      timezone: 'UTC',
      theme: 'system'
    }
  })
  
  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
