import UpsellCard from '../UpsellCard';

const PACKAGES = [
  { label: '1 consulta', price: '0,99€', popular: false },
  { label: '5 consultas', price: '3,49€', popular: true },
  { label: '15 consultas', price: '7,99€', popular: false },
];

export default function ResumenTab() {
  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Metric grid */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        <MetricCard
          value="+18"
          label="Nuevos seguidores"
          sub="últimos 7 días"
          color="text-green"
          trend="up"
        />
        <MetricCard
          value="-5"
          label="Dejaron de seguir"
          sub="últimos 7 días"
          color="text-pink"
          trend="down"
        />
        <MetricCard
          value="134"
          label="Me gusta recibidos"
          sub="últimos 7 días"
          color="text-yellow"
          trend="neutral"
        />
        <MetricCard
          value="23"
          label="Cuentas que espía"
          sub=""
          color="text-purple"
          trend="lock"
        />
      </div>

      {/* Upsell */}
      <UpsellCard />

      {/* Credits section */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-syne font-bold text-base text-text">Comprar créditos de consulta</h3>
          <p className="text-muted text-xs font-dm">Cada crédito = 1 informe de un nuevo perfil</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PACKAGES.map((pkg, i) => (
            <div
              key={pkg.label}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                pkg.popular
                  ? 'border-pink bg-pink/5'
                  : 'border-border bg-card2 hover:border-border/80'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink text-white text-[9px] font-dm font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  + pedido
                </span>
              )}
              <span className="text-text font-syne font-bold text-base">{pkg.price}</span>
              <span className="text-muted text-[10px] font-dm text-center">{pkg.label}</span>
            </div>
          ))}
        </div>

        <button className="w-full bg-pink text-white font-dm font-semibold py-3.5 rounded-xl text-sm hover:bg-pink/90 transition-colors active:scale-[0.98]">
          Comprar ahora
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  value, label, sub, color, trend,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
  trend: 'up' | 'down' | 'neutral' | 'lock';
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-1.5">
      <div className="flex items-start justify-between">
        {trend === 'lock' ? (
          <div className="relative">
            <span className={`font-syne font-bold text-2xl ${color} blur-sm select-none`}>{value}</span>
          </div>
        ) : (
          <span className={`font-syne font-bold text-2xl ${color}`}>{value}</span>
        )}
        {trend === 'up' && (
          <span className="text-green text-xs bg-green/10 px-1.5 py-0.5 rounded-full font-dm">↑</span>
        )}
        {trend === 'down' && (
          <span className="text-pink text-xs bg-pink/10 px-1.5 py-0.5 rounded-full font-dm">↓</span>
        )}
        {trend === 'lock' && (
          <span className="text-[9px] bg-yellow/10 text-yellow px-1.5 py-0.5 rounded-full font-dm border border-yellow/20">
            🔒 Premium
          </span>
        )}
      </div>
      <p className="text-text text-xs font-dm leading-tight">{label}</p>
      {sub && <p className="text-muted text-[10px] font-dm">{sub}</p>}
    </div>
  );
}
