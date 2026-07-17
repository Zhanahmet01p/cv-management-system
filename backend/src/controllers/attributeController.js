const { prisma, updateWithOptimisticLock } = require('../db');

exports.getAllAttributes = async (req, res) => {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAttribute = async (req, res) => {
  const { category, name, type } = req.body;
  try {
    const attribute = await prisma.attribute.create({
      data: { category, name, type }
    });
    res.status(201).json(attribute);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Attribute with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttribute = async (req, res) => {
  const { id } = req.params;
  const { category, name, type, version } = req.body;
  
  try {
    const updated = await updateWithOptimisticLock('attribute', {
      where: { id, version },
      data: {
        category,
        name,
        type
      }
    });
    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({ error: 'VERSION_CONFLICT' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Attribute name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAttribute = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.attribute.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
