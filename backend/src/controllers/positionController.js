const { prisma, updateWithOptimisticLock } = require('../db');

// Get all positions (Public or filtered by access rules)
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      include: {
        attributes: {
          include: { attribute: true }
        },
        tags: true,
        _count: {
          select: { cvs: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single position with details
exports.getPositionById = async (req, res) => {
  const { id } = req.params;
  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        attributes: { include: { attribute: true } },
        tags: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!position) return res.status(404).json({ error: 'Position not found' });
    res.json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create position (Recruiter/Admin only)
exports.createPosition = async (req, res) => {
  const { title, description, accessRules, maxProjects, attributeIds, tags } = req.body;
  try {
    const position = await prisma.position.create({
      data: {
        title,
        description,
        accessRules,
        maxProjects,
        attributes: {
          create: attributeIds.map(id => ({ attributeId: id }))
        },
        tags: {
          create: tags.map(tag => ({ name: tag }))
        }
      }
    });
    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update position with Optimistic Locking
exports.updatePosition = async (req, res) => {
  const { id } = req.params;
  const { title, description, accessRules, maxProjects, attributeIds, tags, version } = req.body;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.position.updateMany({
        where: { id, version },
        data: {
          title,
          description,
          accessRules,
          maxProjects,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new Error('VERSION_CONFLICT');
      }

      if (Array.isArray(attributeIds)) {
        await tx.positionAttribute.deleteMany({ where: { positionId: id } });
        if (attributeIds.length > 0) {
          await tx.positionAttribute.createMany({
            data: attributeIds.map(attrId => ({ positionId: id, attributeId: attrId }))
          });
        }
      }

      if (Array.isArray(tags)) {
        await tx.positionTag.deleteMany({ where: { positionId: id } });
        if (tags.length > 0) {
          await tx.positionTag.createMany({
            data: tags.map(tag => ({ positionId: id, name: tag }))
          });
        }
      }

      return tx.position.findUnique({
        where: { id },
        include: {
          attributes: { include: { attribute: true } },
          tags: true
        }
      });
    });

    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT' || error.code === 'P2025') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Duplicate position
exports.duplicatePosition = async (req, res) => {
  const { id } = req.params;
  try {
    const original = await prisma.position.findUnique({
      where: { id },
      include: { attributes: true, tags: true }
    });

    if (!original) return res.status(404).json({ error: 'Position not found' });

    const duplicated = await prisma.position.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        accessRules: original.accessRules,
        maxProjects: original.maxProjects,
        attributes: {
          create: original.attributes.map(a => ({ attributeId: a.attributeId }))
        },
        tags: {
          create: original.tags.map(t => ({ name: t.name }))
        }
      }
    });
    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePosition = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.position.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createComment = async (req, res) => {
  const { id } = req.params; // Position ID
  const { text } = req.body;
  const userId = req.user.id;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        positionId: id,
        userId,
        text
      },
      include: {
        user: true
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
