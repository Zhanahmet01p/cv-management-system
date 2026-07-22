import React, { forwardRef, useMemo } from 'react';

export const CvTemplate = forwardRef(({ profile, position }, ref) => {
  if (!profile || !position) return null;

  const filteredAttributes = useMemo(() => {
    const requiredAttrIds = new Set(
      (position.attributes || []).map(a => a.attributeId || a.attribute?.id || a.id)
    );
    
    if (requiredAttrIds.size === 0) {
      return profile.attributes || [];
    }

    return (profile.attributes || []).filter(attr => 
      requiredAttrIds.has(attr.attributeId || attr.attribute?.id || attr.id)
    );
  }, [profile.attributes, position.attributes]);

  const filteredProjects = useMemo(() => {
    const positionTags = new Set(
      (position.tags || []).map(t => (typeof t === 'string' ? t.toLowerCase() : t.name?.toLowerCase()))
    );

    let projects = profile.projects || [];

    if (positionTags.size > 0) {
      const matchingProjects = projects.filter(proj => {
        const projTags = (proj.tags || []).map(t => (typeof t === 'string' ? t.toLowerCase() : t.name?.toLowerCase()));
        return projTags.some(tag => positionTags.has(tag));
      });

      if (matchingProjects.length > 0) {
        projects = matchingProjects;
      }
    }

    if (position.maxProjects && position.maxProjects > 0) {
      projects = projects.slice(0, position.maxProjects);
    }

    return projects;
  }, [profile.projects, position.tags, position.maxProjects]);

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <div
        ref={ref}
        style={{
          width: '794px',
          padding: '40px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          boxSizing: 'border-box',
          lineHeight: '1.5',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            paddingBottom: '24px',
            borderBottom: '2px solid #e5e7eb',
            marginBottom: '24px',
          }}
        >
          {profile.photoUrl && (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #4f46e5',
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' }}>
              {profile.fullName || 'Candidate Name'}
            </h1>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#4f46e5',
                marginTop: '4px',
              }}
            >
              {position.title}
            </div>
            {profile.location && (
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                {profile.location}
              </div>
            )}
          </div>
        </div>

        {filteredAttributes.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '6px',
                marginBottom: '14px',
              }}
            >
              Position Relevant Skills
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {filteredAttributes.map((attr, idx) => {
                const val = typeof attr.value === 'object' ? JSON.stringify(attr.value) : attr.value;
                return (
                  <div
                    key={attr.id || idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #f3f4f6',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                      {attr.attribute?.name || 'Skill'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                      {val || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '6px',
                marginBottom: '14px',
              }}
            >
              Relevant Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredProjects.map((proj) => {
                const tags = (proj.tags || []).map((t) => (typeof t === 'string' ? t : t.name));

                return (
                  <div
                    key={proj.id}
                    style={{
                      padding: '14px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                        {proj.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(proj.startDate).toLocaleDateString()} —{' '}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Present'}
                      </span>
                    </div>

                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: '10px',
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {proj.description && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#4b5563',
                          marginTop: '8px',
                          marginBottom: 0,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {proj.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CvTemplate.displayName = 'CvTemplate';