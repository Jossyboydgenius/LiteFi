import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test querying users table
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    // Test querying loan applications table
    const applicationCount = await prisma.loanApplication.count()
    console.log(`📊 Current loan application count: ${applicationCount}`)
    
    // Test querying documents table
    const documentCount = await prisma.document.count()
    console.log(`📊 Current document count: ${documentCount}`)
    
    console.log('\n🎉 Database migration to Prisma Postgres completed successfully!')
    console.log('📝 All tables are ready and accessible.')
    console.log('🌐 You can view your data at: http://localhost:5555 (Prisma Studio)')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()