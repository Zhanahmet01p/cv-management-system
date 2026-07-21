const ProfileTabs = ({ tabs, activeTab, onChange, t }) => {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          className={`tab${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {tab.icon} {t(tab.key)}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
