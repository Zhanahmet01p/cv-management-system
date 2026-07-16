const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Helper for optimistic locking.
 * Use this when you want to update a record while ensuring it hasn't changed.
 * @param {string} model - Prisma model name (e.g., 'user')
 * @param {object} args - Standard prisma update args, must include version in 'where'
 */
const updateWithOptimisticLock = async (model, args) => {
  const { where, data, ...rest } = args;
  
  if (where.version === undefined) {
    throw new Error('Optimistic lock update requires a version in the where clause');
  }

  try {
    const updated = await prisma[model].update({
      where: {
        ...where,
      },
      data: {
        ...data,
        version: { increment: 1 }
      },
      ...rest
    });
    return updated;
  } catch (error) {
    // P2025 is Prisma's error code for "Record to update not found"
    // Which happens if the version doesn't match
    if (error.code === 'P2025') {
      throw new Error('VERSION_CONFLICT');
    }
    throw error;
  }
};

module.exports = {
  prisma,
  updateWithOptimisticLock
};
