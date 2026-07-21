const { prisma, updateWithOptimisticLock } = require('../db');

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attributeValues: {
          include: {
            attribute: true
          }
        },
        projects: true,
        cvs: {
          include: {
            position: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, location, photoUrl, version } = req.body;

  try {
    const updatedUser = await updateWithOptimisticLock('user', {
      where: { id: userId, version },
      data: { firstName, lastName, location, photoUrl }
    });
    res.json(updatedUser);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.upsertAttributeInfo = async (req, res) => {
  const userId = req.user.id;
  const { attributeId, value, version } = req.body;

  try {

    const existing = await prisma.userAttributeValue.findUnique({
      where: { userId_attributeId: { userId, attributeId } }
    });

    if (existing) {

      const lockVersion = version || existing.version;
      const result = await prisma.userAttributeValue.updateMany({
        where: { userId, attributeId, version: lockVersion },
        data: { value, version: { increment: 1 } }
      });

      if (result.count === 0) {
        return res.status(409).json({ error: 'VERSION_CONFLICT' });
      }

      const updated = await prisma.userAttributeValue.findUnique({
        where: { userId_attributeId: { userId, attributeId } },
        include: { attribute: true }
      });
      return res.json(updated);
    }

    const created = await prisma.userAttributeValue.create({
      data: { userId, attributeId, value: value || '', version: 1 },
      include: { attribute: true }
    });
    return res.json(created);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT' || error.code === 'P2025') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.addProject = async (req, res) => {
  const userId = req.user.id;
  const { name, startDate, endDate, description, tags } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        tags
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, description, tags, version } = req.body;

  try {
    const updated = await updateWithOptimisticLock('project', {
      where: { id, version },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        tags
      }
    });
    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const version = parseInt(req.query.version || req.body.version, 10);

  if (!version) {
    return res.status(400).json({ error: 'VERSION_REQUIRED' });
  }

  try {
    const result = await prisma.project.deleteMany({ where: { id, version } });
    if (result.count === 0) {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
