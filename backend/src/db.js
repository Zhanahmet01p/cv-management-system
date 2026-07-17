const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Helper for optimistic locking.
 * Performs an update only when the record version matches the provided version.
 * @param {string} model - Prisma model name (e.g., 'user')
 * @param {object} args - Update arguments, must include version in 'where'
 * @param {object} [args.select]
 * @param {object} [args.include]
 */
const updateWithOptimisticLock = async (model, args) => {
  const { where, data, select, include } = args;

  if (!where || where.version === undefined) {
    throw new Error('Optimistic lock update requires a version in the where clause');
  }

  const whereWithoutVersion = { ...where };
  delete whereWithoutVersion.version;

  const result = await prisma[model].updateMany({
    where,
    data: {
      ...data,
      version: { increment: 1 }
    }
  });

  if (result.count === 0) {
    throw new Error('VERSION_CONFLICT');
  }

  const updated = await prisma[model].findFirst({
    where: whereWithoutVersion,
    select,
    include
  });

  return updated;
};

module.exports = {
  prisma,
  updateWithOptimisticLock
};
