import { useAppStore } from '../../store/appStore';
import { getRandomUsers } from '../../data/spanishUsers';

interface AlertItem {
  icon: string;
  text: string;
  time: string;
  color: string;
}

function buildAlerts(targetUsername: string, followers: { username: string }[]): AlertItem[] {
  const users =
    followers.length >= 4
      ? followers.map((f) => f.username)
      : getRandomUsers(5);

  const [u1, u2, u3, u4, u5] = users;
  const target = targetUsername;

  return [
    {
      icon: '👤',
      text: `@${u1} empezó a seguir a @${target}`,
      time: 'Hoy · 14:23',
      color: 'text-green',
    },
    {
      icon: '❤️',
      text: `@${target} le dio me gusta a una foto de @${u2}`,
      time: 'Hoy · 13:47',
      color: 'text-pink',
    },
    {
      icon: '❌',
      text: `@${u3} dejó de seguir a @${target}`,
      time: 'Ayer · 22:15',
      color: 'text-muted',
    },
    {
      icon: '❤️',
      text: `@${target} le dio me gusta a 3 fotos de @${u4} seguidas`,
      time: 'Ayer · 18:02',
      color: 'text-pink',
    },
    {
      icon: '👤',
      text: `@${u5 || u1} empezó a seguir a @${target}`,
      time: 'Ayer · 09:31',
      color: 'text-green',
    },
  ];
}

export default function AlertasTab() {
  const { profile, followers, targetUsername } = useAppStore();
  const target = profile?.username || targetUsername;
  const alerts = buildAlerts(target, followers);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="mx-4 flex flex-col gap-1">
        <h3 className="font-syne font-bold text-base text-text">Alertas recientes</h3>
        <p className="text-muted text-xs font-dm">Actividad detectada en el perfil</p>
      </div>

      {/* Alert list */}
      <div className="mx-4 flex flex-col gap-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-3.5 flex items-start gap-3 fade-up"
          >
            <span className="text-base flex-shrink-0 mt-0.5">{alert.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-dm leading-snug">{alert.text}</p>
              <p className="text-muted text-xs font-dm mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp upsell */}
      <div className="mx-4 bg-card border border-green/20 rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
              <span className="text-xl">📲</span>
            </div>
            <div>
              <h4 className="font-syne font-bold text-sm text-text">Alertas por WhatsApp</h4>
              <p className="text-muted text-xs font-dm">Notificaciones en tiempo real</p>
            </div>
          </div>

          <p className="text-muted text-xs font-dm leading-relaxed">
            Recibe notificación instantánea cuando siga a alguien, dé me gusta o comente.
          </p>

          <button className="w-full gradient-pink-purple text-white font-dm font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
            Activar alertas Premium
          </button>
        </div>
      </div>
    </div>
  );
}
