import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

type MsgType = 'text' | 'audio' | 'reel' | 'reaction' | 'unsend';

interface Message {
  id: string;
  from: 'them' | 'me';
  type: MsgType;
  text?: string;
  audioDuration?: string;
  audioTranscript?: string;
  reelAuthor?: string;
  reelSeed?: string;
  reactionEmoji?: string;
  time: string;
}

// ─── Male conversations ────────────────────────────────────────────
const CONV_MALE: Record<string, Message[]> = {
  '0': [
    { id: '1', from: 'them', type: 'text', text: 'Tío me caí en el metro delante de todo el mundo 💀', time: '14:21' },
    { id: '2', from: 'me', type: 'text', text: 'JAJAJAJA para qué quiero amigos', time: '14:22' },
    { id: '3', from: 'them', type: 'audio', audioDuration: '0:23', audioTranscript: 'tío en serio qué vergüenza, la gente me miraba como si fuera alienígena, te lo juro por mi madre que casi lloro ahí', time: '14:23' },
    { id: '4', from: 'me', type: 'text', text: 'Anda mándate el reel que pusiste ayer', time: '14:24' },
    { id: '5', from: 'them', type: 'reel', reelAuthor: 'humor.viral.es', reelSeed: 'comedy-bro-1', time: '14:25' },
    { id: '6', from: 'me', type: 'reaction', reactionEmoji: '💀', time: '14:25' },
    { id: '7', from: 'me', type: 'text', text: 'Jajaja exactamente yo, me define', time: '14:26' },
  ],
  '1': [
    { id: '1', from: 'them', type: 'text', text: '¿Viste el partido de ayer tío?', time: '13:10' },
    { id: '2', from: 'me', type: 'text', text: 'Que robazo más grande, no me lo puedo creer', time: '13:11' },
    { id: '3', from: 'them', type: 'reel', reelAuthor: 'futbol.humor', reelSeed: 'football-reel', time: '13:12' },
    { id: '4', from: 'me', type: 'reaction', reactionEmoji: '😂', time: '13:12' },
    { id: '5', from: 'them', type: 'audio', audioDuration: '0:31', audioTranscript: 'tío es que el árbitro estaba comprado, te lo juro, en el minuto 89 cobra ese penalti que ni con ayuda... me entró hasta jaqueca de ver eso', time: '13:14' },
    { id: '6', from: 'me', type: 'text', text: 'Totalmente, una vergüenza', time: '13:15' },
  ],
  '2': [
    { id: '1', from: 'them', type: 'text', text: '¿Qué haces el sábado tío?', time: '12:30' },
    { id: '2', from: 'me', type: 'text', text: 'Nada de momento', time: '12:31' },
    { id: '3', from: 'them', type: 'text', text: 'Fiesta en casa de Paco, cae', time: '12:32' },
    { id: '4', from: 'me', type: 'text', text: '¿Quién va?', time: '12:33' },
    { id: '5', from: 'them', type: 'audio', audioDuration: '0:18', audioTranscript: 'la gente de siempre, Adriana también viene así que no te escaquees tío, que el último finde te perdiste', time: '12:34' },
    { id: '6', from: 'me', type: 'text', text: 'Ok voy, ¿sobre qué hora?', time: '12:36' },
    { id: '7', from: 'them', type: 'text', text: 'Sobre las 22 🥳', time: '12:37' },
    { id: '8', from: 'me', type: 'text', text: 'Ok tío hablamos luego', time: '12:38' },
  ],
  '3': [
    { id: '1', from: 'them', type: 'text', text: '¿Has visto este meme tío? 😂', time: '11:20' },
    { id: '2', from: 'them', type: 'reel', reelAuthor: 'elmundoesunmeme', reelSeed: 'viral-meme-3', time: '11:21' },
    { id: '3', from: 'me', type: 'text', text: 'Madre mía jajaja', time: '11:25' },
    { id: '4', from: 'them', type: 'text', text: 'El mundo está loco jaja', time: '11:26' },
    { id: '5', from: 'me', type: 'reaction', reactionEmoji: '💀', time: '11:26' },
    { id: '6', from: 'them', type: 'unsend', time: '11:28' },
    { id: '7', from: 'me', type: 'text', text: '¿Quedamos esta semana para la play?', time: '11:30' },
  ],
  '4': [
    { id: '1', from: 'them', type: 'text', text: 'Tío ¿me prestas el cargador el jueves?', time: '10:05' },
    { id: '2', from: 'me', type: 'text', text: 'Sí sin problema', time: '10:07' },
    { id: '3', from: 'them', type: 'text', text: 'Crack gracias', time: '10:08' },
    { id: '4', from: 'them', type: 'reel', reelAuthor: 'gamers.es', reelSeed: 'gaming-reel', time: '10:10' },
    { id: '5', from: 'me', type: 'text', text: 'Jajaja eso es demasiado real', time: '10:12' },
    { id: '6', from: 'them', type: 'audio', audioDuration: '0:09', audioTranscript: 'tío en serio me recuerda a nosotros cuando nos pasamos esa noche entera en la play sin dormir', time: '10:14' },
    { id: '7', from: 'me', type: 'text', text: '😂 icónico aquello', time: '10:15' },
  ],
};

// ─── Female conversations ──────────────────────────────────────────
const CONV_FEMALE: Record<string, Message[]> = {
  '0': [
    { id: '1', from: 'them', type: 'text', text: 'Tía mira este look, me muero 😍', time: '14:21' },
    { id: '2', from: 'them', type: 'reel', reelAuthor: 'fashion.inspo.es', reelSeed: 'fashion-reel-1', time: '14:22' },
    { id: '3', from: 'me', type: 'reaction', reactionEmoji: '😍', time: '14:22' },
    { id: '4', from: 'me', type: 'text', text: 'Dios mío quiero ese vestido ya', time: '14:23' },
    { id: '5', from: 'them', type: 'audio', audioDuration: '0:19', audioTranscript: 'tía lo vi en Zara la semana pasada y ya no estaba, me quedé con el corazón roto en serio, mira si lo encuentras online', time: '14:24' },
    { id: '6', from: 'me', type: 'text', text: 'Ahora mismo lo busco!!', time: '14:25' },
    { id: '7', from: 'them', type: 'text', text: 'Si lo encuentras me avisas 🥹', time: '14:26' },
  ],
  '1': [
    { id: '1', from: 'them', type: 'reel', reelAuthor: 'lachicadelmeme', reelSeed: 'girly-meme-2', time: '13:10' },
    { id: '2', from: 'me', type: 'text', text: 'JAJAJA esto somos nosotras 100% 💀', time: '13:11' },
    { id: '3', from: 'them', type: 'audio', audioDuration: '0:13', audioTranscript: 'ay en serio que ridículas somos tía, me estoy muriendo de risa aquí yo sola en el metro', time: '13:12' },
    { id: '4', from: 'me', type: 'text', text: 'Oye para cuándo quedamos para el brunch', time: '13:14' },
    { id: '5', from: 'them', type: 'text', text: '¿Este domingo?', time: '13:15' },
    { id: '6', from: 'me', type: 'text', text: 'Perfecto me apunto guapa 🥐', time: '13:15' },
    { id: '7', from: 'them', type: 'reaction', reactionEmoji: '❤️', time: '13:15' },
  ],
  '2': [
    { id: '1', from: 'them', type: 'text', text: 'Tía necesito contarte algo 😭', time: '12:30' },
    { id: '2', from: 'me', type: 'text', text: 'Qué pasó??? cuéntame', time: '12:31' },
    { id: '3', from: 'them', type: 'audio', audioDuration: '0:47', audioTranscript: 'pues que quedé con Marcos el jueves y fue rarísimo, me ignoró toda la noche y luego al final me dijo que no estaba listo para nada serio, tía no lo entiendo', time: '12:34' },
    { id: '4', from: 'me', type: 'text', text: 'Ay no tía lo siento muchísimo 😭 tú te mereces algo mejor', time: '12:36' },
    { id: '5', from: 'them', type: 'text', text: 'Lo sé... pero duele igual', time: '12:38' },
    { id: '6', from: 'me', type: 'text', text: 'Esta semana quedamos y me lo cuentas todo, te invito', time: '12:39' },
    { id: '7', from: 'them', type: 'reaction', reactionEmoji: '🥹', time: '12:39' },
  ],
  '3': [
    { id: '1', from: 'them', type: 'text', text: 'Tía nos vamos de chicas el viernes?? 🥂', time: '11:20' },
    { id: '2', from: 'me', type: 'text', text: 'Claro!! ¿dónde?', time: '11:21' },
    { id: '3', from: 'them', type: 'reel', reelAuthor: 'nightout.madrid', reelSeed: 'girls-night', time: '11:22' },
    { id: '4', from: 'me', type: 'text', text: '¿Ese sitio nuevo? Tiene muy buena pinta', time: '11:24' },
    { id: '5', from: 'them', type: 'audio', audioDuration: '0:22', audioTranscript: 'sí lo vi en instagram y tiene unas vistas increíbles, y los cócteles son monísimos, creo que lo van a flipar todas', time: '11:26' },
    { id: '6', from: 'me', type: 'text', text: 'Hecho tía, avisa a las demás 🥂', time: '11:28' },
    { id: '7', from: 'them', type: 'unsend', time: '11:29' },
  ],
  '4': [
    { id: '1', from: 'them', type: 'text', text: 'Tía ¿has probado ya el nuevo de skincare que te dije?', time: '10:05' },
    { id: '2', from: 'me', type: 'text', text: 'Sí!! me encanta, la piel me ha cambiado un montón', time: '10:07' },
    { id: '3', from: 'them', type: 'text', text: 'Verdad que sí 😍 yo ya no lo dejo', time: '10:08' },
    { id: '4', from: 'them', type: 'reel', reelAuthor: 'beauty.routines', reelSeed: 'skincare-reel', time: '10:10' },
    { id: '5', from: 'me', type: 'text', text: 'Mira que bien explicado 👏', time: '10:12' },
    { id: '6', from: 'them', type: 'audio', audioDuration: '0:11', audioTranscript: 'tía en serio desde que lo uso por las noches estoy obsesionada, no me imagino sin él ya', time: '10:14' },
    { id: '7', from: 'me', type: 'text', text: 'Tengo que conseguir el de noche también', time: '10:15' },
  ],
};

const MALE_USERS = [
  { name: 'fernando_gil',  avatarN: 12, online: true },
  { name: 'diego.lopez_',  avatarN: 26, online: true },
  { name: 'carlos_fdz',    avatarN: 33, online: false },
  { name: 'pablo.m',       avatarN: 52, online: false },
  { name: 'sergio_rv',     avatarN: 61, online: false },
];
const MALE_PRIVATE_USERS = [
  { name: 'Fer*****', avatarN: 12, online: true },
  { name: 'die*****', avatarN: 26, online: true },
  { name: 'car*****', avatarN: 33, online: false },
  { name: 'pab*****', avatarN: 52, online: false },
  { name: 'ser*****', avatarN: 61, online: false },
];

const FEMALE_USERS = [
  { name: 'laura.garcia_', avatarN: 5,  online: true },
  { name: 'isabel.v',      avatarN: 9,  online: true },
  { name: 'maria_rm',      avatarN: 16, online: false },
  { name: 'daniela_c',     avatarN: 20, online: false },
  { name: 'carmen.lp',     avatarN: 44, online: false },
];
const FEMALE_PRIVATE_USERS = [
  { name: 'lau*****', avatarN: 5,  online: true },
  { name: 'isa*****', avatarN: 9,  online: true },
  { name: 'mar*****', avatarN: 16, online: false },
  { name: 'dan*****', avatarN: 20, online: false },
  { name: 'car*****', avatarN: 44, online: false },
];

function avatarUrl(n: number) {
  return `https://i.pravatar.cc/150?img=${n}`;
}

export default function DMChatScreen() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, targetGender } = useAppStore();
  const isFemale = targetGender === 'female';
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatId = id || '0';
  const idx = parseInt(chatId) || 0;

  // Name comes from the URL param set by MensajesTab — guarantees exact match
  const paramName   = searchParams.get('name');
  const paramOnline = searchParams.get('online') === '1';

  // Fallback avatar index per slot (visual only, not the name)
  const AVATAR_NS = [4, 18, 27, 38, 11, 6, 31, 45];
  const avatarN = AVATAR_NS[idx] || 4;

  // If no name in URL (e.g. direct navigation), fall back to gender-appropriate default
  const isPrivate = profile?.is_private ?? false;
  const defaultPrivateName = isFemale
    ? (['lau*****', 'isa*****', 'mar*****', 'dan*****', 'car*****'][idx] || 'usu*****')
    : (['Fer*****', 'die*****', 'car*****', 'pab*****', 'ser*****'][idx] || 'usu*****');

  const conversations = isFemale ? CONV_FEMALE : CONV_MALE;

  const user = {
    name: paramName || (isPrivate ? defaultPrivateName : (isFemale ? FEMALE_USERS : MALE_USERS)[idx]?.name || 'usuario'),
    avatarN,
    online: paramOnline,
  };

  useEffect(() => {
    setMessages(conversations[chatId] || conversations['0']);
  }, [chatId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setSendError(false);
    const newMsg: Message = {
      id: Date.now().toString(),
      from: 'me',
      type: 'text',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => setSendError(true), 800);
    setTimeout(() => {
      setSendError(false);
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
    }, 2200);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#262626', background: '#000' }}>
        <button onClick={() => navigate('/dashboard')} className="p-1">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 4L7 11l7 7" stroke="#f5f5f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="relative">
          <img src={avatarUrl(user.avatarN)} alt="" className="w-9 h-9 rounded-full object-cover" />
          {user.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: '#00e5a0', borderColor: '#000' }} />
          )}
        </div>

        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{user.name}</span>
          {user.online && <span className="text-xs" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>En línea</span>}
        </div>

        <div className="flex items-center gap-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 5.5a9.5 9.5 0 0 1 13.5 0M6.5 8.5a6 6 0 0 1 9 0M9 11.5a2.5 2.5 0 0 1 4 0M11 14.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" stroke="#f5f5f5" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="5" width="10" height="12" rx="1.5" stroke="#f5f5f5" strokeWidth="1.4"/>
            <path d="M13 8.5l6-3v11l-6-3" stroke="#f5f5f5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2" style={{ paddingBottom: '80px' }}>
        <div className="flex items-center justify-center mb-3">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#8e8e8e', fontFamily: 'system-ui' }}>
            Hoy
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} userName={user.name} userAvatarN={user.avatarN} />
        ))}

        {sendError && (
          <div className="flex items-center justify-center fade-up">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(237,73,86,0.15)', border: '1px solid rgba(237,73,86,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#ed4956" strokeWidth="1.3"/>
                <path d="M7 4v3.5M7 9.5v.5" stroke="#ed4956" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-xs" style={{ color: '#ed4956', fontFamily: 'system-ui' }}>
                No se pudo enviar el mensaje. Inténtalo de nuevo.
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{ background: '#000', borderTop: '1px solid #262626' }}>
        <div className="w-full max-w-[480px] flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#0095f6" strokeWidth="1.5"/>
              <path d="M10 14h8M14 10v8" stroke="#0095f6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="flex-1 flex items-center rounded-full px-4 py-2.5"
            style={{ background: '#1a1a1a', border: '1px solid #363636' }}>
            <input
              type="text"
              placeholder="Mensaje..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}
            />
            {!inputText && (
              <div className="flex items-center gap-3 ml-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8.5" stroke="#8e8e8e" strokeWidth="1.3"/>
                  <path d="M7 11.5s1 1.5 3 1.5 3-1.5 3-1.5M7.5 8h.5M12 8h.5" stroke="#8e8e8e" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="5" width="10" height="10" rx="1.5" stroke="#8e8e8e" strokeWidth="1.3"/>
                  <path d="M3 10l4-3 3 3 2-2 5 4" stroke="#8e8e8e" strokeWidth="1.2"/>
                </svg>
              </div>
            )}
          </div>

          {inputText ? (
            <button onClick={handleSend} className="text-sm font-semibold flex-shrink-0"
              style={{ color: '#0095f6', fontFamily: 'system-ui' }}>
              Enviar
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#8e8e8e" strokeWidth="1.4"/>
                <path d="M11 7v4l3 3" stroke="#8e8e8e" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 16.5S4 12.5 4 8a4 4 0 0 1 7-2.65A4 4 0 0 1 18 8c0 4.5-7 8.5-7 8.5z" stroke="#8e8e8e" strokeWidth="1.4"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, userName, userAvatarN }: { msg: Message; userName: string; userAvatarN: number }) {
  const isMe = msg.from === 'me';
  const [showTranscript, setShowTranscript] = useState(false);

  if (msg.type === 'unsend') {
    return (
      <div className="flex justify-start">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{ border: '1px solid #363636', background: 'transparent' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 5.5a2.5 2.5 0 0 1 4 0M2 7a5 5 0 0 1 10 0" stroke="#8e8e8e" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="2" y1="2" x2="12" y2="12" stroke="#8e8e8e" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-sm" style={{ color: '#8e8e8e', fontFamily: 'system-ui', fontStyle: 'italic' }}>
            Mensaje eliminado
          </span>
        </div>
      </div>
    );
  }

  if (msg.type === 'reaction') {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <span className="text-xs px-2" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>
          {isMe ? 'Tú' : userName} reaccionó con {msg.reactionEmoji || '❤️'}
        </span>
      </div>
    );
  }

  if (msg.type === 'reel') {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
        {!isMe && <img src={`https://i.pravatar.cc/150?img=${userAvatarN}`} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />}
        <div style={{ maxWidth: 200, borderRadius: 14, overflow: 'hidden', border: '1px solid #363636' }}>
          <div className="relative" style={{ height: 130, background: '#1a1a1a' }}>
            <img
              src={`https://picsum.photos/seed/${msg.reelSeed || 'reel1'}/200/130`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.55)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                  <path d="M4 2.5l12 6.5L4 15.5V2.5z"/>
                </svg>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                <rect x="1" y="1" width="8" height="8" rx="1" stroke="white" strokeWidth="1"/>
                <path d="M1 3.5h8M1 6.5h8M4.5 1v8" stroke="white" strokeWidth="0.7"/>
              </svg>
              <span style={{ color: 'white', fontSize: 9, fontFamily: 'system-ui', fontWeight: 600 }}>Reel</span>
            </div>
          </div>
          <div className="px-3 py-2" style={{ background: '#1a1a1a' }}>
            <p style={{ color: '#8e8e8e', fontSize: 11, fontFamily: 'system-ui' }}>@{msg.reelAuthor}</p>
            <p style={{ color: '#f5f5f5', fontSize: 11, fontFamily: 'system-ui', marginTop: 1 }}>
              {isMe ? 'Tú enviaste un reel' : `${userName} te envió un reel`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (msg.type === 'audio') {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
        {!isMe && <img src={`https://i.pravatar.cc/150?img=${userAvatarN}`} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />}
        <div className="flex flex-col gap-1" style={{ maxWidth: 240 }}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer active:opacity-80"
            style={{ background: isMe ? '#0095f6' : '#1a1a1a' }}
            onClick={() => setShowTranscript((s) => !s)}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: isMe ? 'rgba(255,255,255,0.2)' : '#2a2a2a' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill={isMe ? 'white' : '#8e8e8e'}>
                <path d="M3 3l9 4-9 4V3z"/>
              </svg>
            </div>
            <div className="flex items-center gap-0.5 flex-1">
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} className="rounded-full"
                  style={{ width: 2, height: i % 3 === 0 ? 14 : i % 2 === 0 ? 8 : 11, background: isMe ? 'rgba(255,255,255,0.6)' : '#444' }} />
              ))}
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : '#8e8e8e', fontFamily: 'system-ui' }}>
              {msg.audioDuration}
            </span>
          </div>

          {showTranscript && (
            <div className="px-3 py-2.5 rounded-2xl fade-up"
              style={{ background: isMe ? '#1a4a70' : '#222', border: '1px solid #333' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <rect x="1" y="3.5" width="9" height="7" rx="1.5" stroke="#8e8e8e" strokeWidth="1"/>
                  <path d="M3.5 3.5V2.5a2 2 0 0 1 4 0v1" stroke="#8e8e8e" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                <span style={{ color: '#8e8e8e', fontSize: 9.5, fontFamily: 'system-ui' }}>
                  No se puede reproducir · Solo transcripción
                </span>
              </div>
              <p style={{ color: '#ccc', fontSize: 12.5, fontFamily: 'system-ui', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{msg.audioTranscript}"
              </p>
            </div>
          )}

          {!showTranscript && (
            <span style={{ color: '#555', fontSize: 10, fontFamily: 'system-ui', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0 }}>
              Toca para ver la transcripción
            </span>
          )}
        </div>
      </div>
    );
  }

  // text
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isMe && <img src={`https://i.pravatar.cc/150?img=${userAvatarN}`} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />}
      <div className="px-4 py-2.5 rounded-2xl" style={{ background: isMe ? '#3797f0' : '#1a1a1a', maxWidth: '70%' }}>
        <p className="text-sm" style={{ color: '#f5f5f5', fontFamily: 'system-ui', wordBreak: 'break-word' }}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}
