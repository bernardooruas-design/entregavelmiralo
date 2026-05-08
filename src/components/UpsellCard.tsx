export default function UpsellCard() {
  return (
    <div className="mx-4 bg-card border border-pink/30 rounded-2xl overflow-hidden">
      {/* Header gradient */}
      <div className="gradient-pink-purple p-4 flex flex-col gap-1">
        <span className="text-white font-syne font-bold text-base">
          Desbloquea el Informe Completo
        </span>
        <p className="text-white/80 text-xs font-dm leading-relaxed">
          Ve todo lo que pasa en este perfil — a quién sigue en secreto, quién más interactúa y mucho más.
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Benefits */}
        <ul className="flex flex-col gap-2.5">
          {[
            'A quién ha añadido en los últimos 30 días',
            'Lista completa de cuentas que espía',
            'Horarios de mayor actividad',
            'Alertas en tiempo real por WhatsApp',
            'A quién más le da me gusta y comenta',
          ].map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <span className="text-pink text-sm mt-0.5 flex-shrink-0">✦</span>
              <span className="text-text text-sm font-dm">{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button className="w-full gradient-pink-purple text-white font-dm font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
          Ver informe completo
        </button>

        <p className="text-center text-muted text-xs font-dm">
          Por solo <span className="text-text font-medium">4,99€/mes</span> · cancela cuando quieras
        </p>
      </div>
    </div>
  );
}
