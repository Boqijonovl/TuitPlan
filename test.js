const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    try {
        let settings = await prisma.systemSetting.findUnique({
            where: { id: "GLOBAL" }
        });
        console.log(settings);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
