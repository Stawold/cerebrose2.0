import { Link, useLocation } from 'react-router-dom';

// Deliberately unlabeled and out of the way — the test/content tool isn't
// meant to be discoverable from the main menu. Access to /test-lab itself
// still requires the admin password (see TestLab.jsx's login gate).
export default function SecretTestLabLauncher() {
  const location = useLocation();
  if (location.pathname === '/test-lab') return null;

  return (
    <Link
      to="/test-lab"
      title="Outil de test"
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        zIndex: 500,
        fontSize: '1.1rem',
        opacity: 0.25,
        textDecoration: 'none',
        lineHeight: 1
      }}
    >
      🛠️
    </Link>
  );
}
