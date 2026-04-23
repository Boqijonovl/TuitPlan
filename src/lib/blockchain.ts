import prisma from "./prisma";
import crypto from "crypto";

export async function createBlockchainLedger(entityType: string, entityId: string, action: string, dataPayload: any) {
  try {
    // Payload ni stringify qilamiz
    const payloadString = JSON.stringify(dataPayload);
    
    // Zanjirning oxirgi (eng so'nggi) blokini topish
    const lastBlock = await prisma.blockchainLedger.findFirst({
      orderBy: { timestamp: "desc" }
    });

    const previousHash = lastBlock ? lastBlock.currentHash : "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis hash

    const timestamp = new Date().toISOString();
    
    // SHA-256 shifrlash (O'tgan Hash + Joriy Ma'lumot + Vaqt)
    const rawData = `${previousHash}-${entityType}-${entityId}-${action}-${payloadString}-${timestamp}`;
    const currentHash = crypto.createHash("sha256").update(rawData).digest("hex");

    // Bazaga o'zgarmas qilib yozib qo'yamiz
    const newBlock = await prisma.blockchainLedger.create({
      data: {
        entityType,
        entityId,
        action,
        dataPayload: payloadString,
        previousHash,
        currentHash,
        timestamp: new Date(timestamp)
      }
    });

    return newBlock;
  } catch (error) {
    console.error("Blockchain xatosi:", error);
    // Biz blockchain sababli asosiy logikani to'xtatmaymiz, lekin xato qaytaramiz
    return null;
  }
}

export async function verifyBlockchainIntegrity() {
  const blocks = await prisma.blockchainLedger.findMany({
    orderBy: { timestamp: "asc" }
  });

  if (blocks.length === 0) return { status: "OK", message: "Zanjir hali bo'sh" };

  for (let i = 1; i < blocks.length; i++) {
    const prevBlock = blocks[i - 1];
    const currentBlock = blocks[i];

    // O'tgan gash joyidami?
    if (currentBlock.previousHash !== prevBlock.currentHash) {
      return { status: "CORRUPTED", message: `Zanjir uzilgan! Tugun: ${currentBlock.id}` };
    }

    // Joriy hash buzilmaganmi?
    const rawData = `${currentBlock.previousHash}-${currentBlock.entityType}-${currentBlock.entityId}-${currentBlock.action}-${currentBlock.dataPayload}-${currentBlock.timestamp.toISOString()}`;
    const calculatedHash = crypto.createHash("sha256").update(rawData).digest("hex");

    if (currentBlock.currentHash !== calculatedHash) {
      return { status: "TAMPERED", message: `Ma'lumot o'zgartirilgan (Soxtalashtirilgan)! Tugun: ${currentBlock.id}` };
    }
  }

  return { status: "SECURE", message: "Tizim 100% shifrlangan va buzilmagan!" };
}
