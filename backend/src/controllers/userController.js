const { prisma, updateWithOptimisticLock } = require('../db');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, version } = req.body;

  if (!role || !['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const updated = await updateWithOptimisticLock('user', {
      where: { id, version },
      data: { role }
    });
    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.toggleBlockUser = async (req, res) => {
  const { id } = req.params;
  const { version } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot block yourself' });
    }

    const updated = await updateWithOptimisticLock('user', {
      where: { id, version },
      data: { blocked: !user.blocked }
    });
    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
