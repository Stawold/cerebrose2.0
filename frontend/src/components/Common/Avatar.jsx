import { avatarColor, initials } from '../../services/gameLogic';

export default function Avatar({ pseudo, connected = true, size = 36 }) {
  return (
    <div
      className={`avatar${connected ? '' : ' disconnected'}`}
      style={{ background: avatarColor(pseudo), width: size, height: size, minWidth: size, fontSize: size * 0.26 }}
    >
      {initials(pseudo)}
    </div>
  );
}
