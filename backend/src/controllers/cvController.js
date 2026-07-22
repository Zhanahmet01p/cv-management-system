const { prisma, updateWithOptimisticLock } = require('../db');

exports.createCV = async (req, res) => {
  const userId = req.user.id;
  const { positionId } = req.body;

  try {
    const existingCV = await prisma.cV.findUnique({
      where: { userId_positionId: { userId, positionId } }
    });
    if (existingCV) return res.status(400).json({ error: 'CV already exists for this position' });

    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { attributes: true }
    });
    if (!position) return res.status(404).json({ error: 'Position not found' });

    const cv = await prisma.cV.create({
      data: {
        userId,
        positionId,
        status: 'DRAFT'
      }
    });

    const existingUserAttrs = await prisma.userAttributeValue.findMany({
      where: { userId },
      select: { attributeId: true }
    });
    const existingAttrIds = new Set(existingUserAttrs.map(a => a.attributeId));

    const missingAttrs = position.attributes
      .filter(pa => !existingAttrIds.has(pa.attributeId))
      .map(pa => ({
        userId,
        attributeId: pa.attributeId,
        value: ''
      }));

    if (missingAttrs.length > 0) {
      await prisma.userAttributeValue.createMany({
        data: missingAttrs
      });
    }

    res.status(201).json(cv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCVData = async (req, res) => {
  const { id } = req.params;
  const viewerId = req.user.id;
  const viewerRole = req.user.role;

  try {
    const cv = await prisma.cV.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            projects: true,
            attributeValues: { include: { attribute: true } }
          }
        },
        position: {
          include: {
            attributes: { include: { attribute: true } },
            tags: true
          }
        }
      }
    });

    if (!cv) return res.status(404).json({ error: 'CV not found' });

    if (viewerRole === 'CANDIDATE' && cv.userId !== viewerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (viewerRole === 'RECRUITER' && cv.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const positionTags = cv.position.tags.map(t => t.name.toLowerCase());
    const relevantProjects = cv.user.projects
      .filter(p => p.tags.some(tag => positionTags.includes(tag.toLowerCase())))
      .slice(0, cv.position.maxProjects);

    const requiredAttrIds = cv.position.attributes.map(a => a.attributeId);
    const relevantAttributes = cv.user.attributeValues
      .filter(av => requiredAttrIds.includes(av.attributeId));

    res.json({
      cv,
      assembledData: {
        fullName: `${cv.user.firstName || ''} ${cv.user.lastName || ''}`.trim(),
        location: cv.user.location,
        photoUrl: cv.user.photoUrl,
        attributes: relevantAttributes,
        projects: relevantProjects
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  const userId = req.user.id;
  const { cvId } = req.params;

  try {
    const existingLike = await prisma.like.findUnique({
      where: { cvId_userId: { cvId, userId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { cvId_userId: { cvId, userId } } });
      res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { cvId, userId } });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishCV = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { version } = req.body;

  try {
    const cv = await prisma.cV.findUnique({ where: { id } });
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    if (req.user.role !== 'ADMIN' && cv.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await updateWithOptimisticLock('cV', {
      where: { id, version },
      data: { status: 'PUBLISHED' }
    });
    res.json(updated);
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') return res.status(409).json({ error: 'VERSION_CONFLICT' });
    res.status(500).json({ error: error.message });
  }
};