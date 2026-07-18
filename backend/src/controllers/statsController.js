const { prisma } = require('../db');

exports.getStats = async (req, res) => {
  try {
    const totalPositions = await prisma.position.count();
    const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const totalRecruiters = await prisma.user.count({ where: { role: 'RECRUITER' } });
    const totalCVs = await prisma.cV.count();
    const totalSubmittedCVs = await prisma.cV.count({ where: { status: 'PUBLISHED' } });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const cvsLast24h = await prisma.cV.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    res.json({
      totalPositions,
      totalCandidates,
      totalRecruiters,
      totalCVs,
      totalSubmittedCVs,
      cvsLast24h
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
