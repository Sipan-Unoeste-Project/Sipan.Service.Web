export default function ApacTabs({ tabs, active, onChange }) {
  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map((tab) => (
        <li className="nav-item" key={tab.id}>
          <button
            type="button"
            className={`nav-link ${active === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
