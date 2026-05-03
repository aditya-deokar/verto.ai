
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const keys = await prisma.mcpApiKey.findMany({
    include: {
      user: true
    }
  });
  console.log('Found MCP API Keys:', JSON.stringify(keys, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
