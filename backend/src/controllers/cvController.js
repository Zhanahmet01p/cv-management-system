const { prisma, updateWithOptimisticLock } = require('../db');

// Create/Generate CV for a position
exports.createCV = async (req, res) => {
  const userId = req.user.id;
  const { positionId } = req.body;

  try {
    // 1. Check if CV already exists
    const existingCV = await prisma.cV.findUnique({
      where: { userId_positionId: { userId, positionId } }
    });
    if (existingCV) return res.status(400).json({ error: 'CV already exists for this position' });

    // 2. Check position access rules (Logic simplified for now)
    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (!position) return res.status(404).json({ error: 'Position not found' });

    // 3. Create CV (stored as "created", but content will be looked up)
    const cv = await prisma.cV.create({
      data: {
        userId,
        positionId,
        status: 'DRAFT'
      }
    });

    res.status(201).json(cv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Rendered CV (Virtual assembly)
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

    // Authorization check
    // Candidates can only see their own CV. Recruiters/Admins can see if published or they are recruiters.
    if (viewerRole === 'CANDIDATE' && cv.userId !== viewerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (viewerRole === 'RECRUITER' && cv.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // ASSEMBLY LOGIC (Killer Feature #3)
    // Filter projects by position tags
    const positionTags = cv.position.tags.map(t => t.name.toLowerCase());
    const relevantProjects = cv.user.projects
      .filter(p => p.tags.some(tag => positionTags.includes(tag.toLowerCase())))
      .slice(0, cv.position.maxProjects);

    // Filter attributes by those required in position
    const requiredAttrIds = cv.position.attributes.map(a => a.attributeId);
    const relevantAttributes = cv.user.attributeValues
      .filter(av => requiredAttrIds.includes(av.attributeId));

    res.json({
      cv,
      assembledData: {
        fullName: `${cv.user.firstName} ${cv.user.lastName}`,
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

// Toggle Like (Recruiters only)
exports.toggleLike = async (req, res) => {
  const userId = req.user.id; // Must be RECRUITER
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

// Publish CV
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
