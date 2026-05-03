import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/8e2ca8bc-a5fd-45c7-9571-bb4ee0c26311";
const POSTS_URL = "https://functions.poehali.dev/9f18c3ea-b7f4-493d-929e-c79468fc0f72";

const BG_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/9543ece1-9a29-4302-9a82-cd82c7165b4d.jpg";
const DOG_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/22e70b04-2a5d-476e-abe9-5024ae3850fc.jpg";
const CAT_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/d729877a-2748-40b1-a4c3-63b107f0302e.jpg";
const RABBIT_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/0da7b96f-1cf1-426d-9f4a-1551dea68775.jpg";
const OWNER_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/f364a9d1-93a9-49e0-ac1c-4cdfa628821b.jpg";

const COMMUNITIES = [
  { id: 1, name: "Золотистые ретриверы", members: "12 450", icon: "🐕", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: 2, name: "Британские кошки", members: "9 200", icon: "🐈", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: 3, name: "Кролики и грызуны", members: "4 800", icon: "🐇", color: "bg-rose-50 text-rose-800 border-rose-200" },
  { id: 4, name: "Попугаи и птицы", members: "3 100", icon: "🦜", color: "bg-green-50 text-green-800 border-green-200" },
  { id: 5, name: "Лабрадоры", members: "8 700", icon: "🦮", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  { id: 6, name: "Мейн-куны", members: "5 300", icon: "🐱", color: "bg-orange-50 text-orange-800 border-orange-200" },
];

const PETS_SEARCH = [
  { id: 1, name: "Рекс", breed: "Лабрадор", age: "2 года", city: "Москва", image: DOG_IMG, type: "Собака" },
  { id: 2, name: "Митси", breed: "Шотландская вислоухая", age: "4 года", city: "Казань", image: CAT_IMG, type: "Кошка" },
  { id: 3, name: "Пух", breed: "Ангорский кролик", age: "1 год", city: "Новосибирск", image: RABBIT_IMG, type: "Кролик" },
];

type Tab = "feed" | "communities" | "search" | "profile";

interface User { id: number; name: string; email: string; city: string; bio: string; avatar: string; }
interface Post {
  id: number; text: string; petName: string; species: string; image: string;
  time: string; userId: number; userName: string; userAvatar: string;
  likes: number; comments: number; liked: boolean;
}
interface Comment { id: number; text: string; time: string; userName: string; userAvatar: string; }

function authFetch(action: string, body: object, sessionId?: string) {
  return fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(sessionId ? { "X-Session-Id": sessionId } : {}) },
    body: JSON.stringify({ action, ...body }),
  }).then(r => r.json());
}

function postsFetch(action: string, body: object = {}, sessionId?: string) {
  return fetch(POSTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(sessionId ? { "X-Session-Id": sessionId } : {}) },
    body: JSON.stringify({ action, ...body }),
  }).then(r => r.json());
}

function postsFetchGet(action: string, params: Record<string, string> = {}, sessionId?: string) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  return fetch(`${POSTS_URL}?${qs}`, {
    headers: { ...(sessionId ? { "X-Session-Id": sessionId } : {}) },
  }).then(r => r.json());
}

function getInitial(name: string) { return (name || "?")[0].toUpperCase(); }

// ─── Auth Screen ────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }: { onLogin: (user: User, sid: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const res = await authFetch(mode, { email, password, name });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    localStorage.setItem("pawspace_session", res.session_id);
    onLogin(res.user, res.session_id);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url(${BG_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="fixed inset-0 -z-10" style={{ background: "hsla(35,25%,97%,0.6)" }} />

      <div className="w-full max-w-sm animate-scale-in" style={{ opacity: 0 }}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="font-display text-4xl font-semibold text-foreground">PawSpace</h1>
          <p className="text-sm font-body text-muted-foreground mt-1">Социальная сеть для владельцев питомцев</p>
        </div>

        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-5">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === "register" && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя"
                className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
              className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password"
              onKeyDown={e => { if (e.key === "Enter") submit(); }}
              className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>

          {error && <p className="text-sm font-body text-destructive mt-3 text-center">{error}</p>}

          <button onClick={submit} disabled={loading}
            className="w-full mt-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Icon name="Loader" size={16} className="animate-spin" />}
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function Index() {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem("pawspace_session"));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [searchSpecies, setSearchSpecies] = useState("Все");
  const [profileTab, setProfileTab] = useState<"pets" | "posts">("pets");

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostPet, setNewPostPet] = useState("");
  const [newPostImg, setNewPostImg] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfile, setEditProfile] = useState<User | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Restore session
  useEffect(() => {
    if (!sessionId) { setAuthLoading(false); return; }
    authFetch("me", {}, sessionId).then(res => {
      if (res.user) { setUser(res.user); } else { localStorage.removeItem("pawspace_session"); setSessionId(null); }
      setAuthLoading(false);
    });
  }, []);

  // Load feed
  const loadPosts = () => {
    setPostsLoading(true);
    postsFetchGet("feed", {}, sessionId || undefined).then(data => {
      if (Array.isArray(data)) setPosts(data);
      setPostsLoading(false);
    });
  };

  useEffect(() => { if (user) loadPosts(); }, [user]);

  const handleLogin = (u: User, sid: string) => { setUser(u); setSessionId(sid); };
  const handleLogout = () => { localStorage.removeItem("pawspace_session"); setSessionId(null); setUser(null); setPosts([]); };

  // Toggle like
  const toggleLike = async (postId: number) => {
    if (!sessionId) return;
    const res = await postsFetch("like", { postId }, sessionId);
    if (res.likes !== undefined) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.likes, liked: res.liked } : p));
    }
  };

  // Toggle comments
  const toggleComments = async (postId: number) => {
    setOpenComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); return next; }
      next.add(postId);
      return next;
    });
    if (!postComments[postId]) {
      const data = await postsFetchGet("comments", { postId: String(postId) }, sessionId || undefined);
      if (Array.isArray(data)) setPostComments(prev => ({ ...prev, [postId]: data }));
    }
  };

  const submitComment = async (postId: number) => {
    const text = (commentTexts[postId] || "").trim();
    if (!text || !sessionId) return;
    const res = await postsFetch("comment", { postId, text }, sessionId);
    if (res.id) {
      setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res] }));
      setCommentTexts(prev => ({ ...prev, [postId]: "" }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImg) return;
    if (!sessionId) return;
    setPostLoading(true);
    const res = await postsFetch("create", { text: newPostText, petName: newPostPet, image: newPostImg || "" }, sessionId);
    setPostLoading(false);
    if (res.id) {
      setNewPostText(""); setNewPostPet(""); setNewPostImg(null); setShowCreatePost(false);
      loadPosts();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewPostImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Save profile
  const saveProfile = async () => {
    if (!sessionId || !editProfile) return;
    setEditLoading(true);
    await authFetch("update", { name: editProfile.name, city: editProfile.city, bio: editProfile.bio, avatar: editProfile.avatar }, sessionId);
    setUser(editProfile);
    setEditLoading(false);
    setShowEditProfile(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setEditProfile(p => p ? { ...p, avatar: ev.target?.result as string } : p);
    reader.readAsDataURL(file);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return "только что";
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
      return `${Math.floor(diff / 86400)} д назад`;
    } catch { return iso; }
  };

  const speciesOptions = ["Все", "Собака", "Кошка", "Кролик"];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url(${BG_IMG})`, backgroundSize: "cover" }} />
        <div className="fixed inset-0 -z-10" style={{ background: "hsla(35,25%,97%,0.6)" }} />
        <Icon name="Loader" size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url(${BG_IMG})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 -z-10" style={{ background: "hsla(35,25%,97%,0.55)" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-display text-2xl font-semibold text-foreground tracking-wide">PawSpace</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
              <Icon name="Bell" size={18} />
            </button>
            <button onClick={() => setActiveTab("profile")} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold text-sm overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitial(user.name)}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-24">

        {/* FEED TAB */}
        {activeTab === "feed" && (
          <div className="px-4 pt-5">
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
              {[
                { name: "Вы", isImg: false },
                { name: "Барон", avatar: DOG_IMG },
                { name: "Луна", avatar: CAT_IMG },
                { name: "Снежок", avatar: RABBIT_IMG },
                { name: "Бобик", avatar: "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/d4613076-e102-4cb4-bff4-46474844696f.jpg" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                  <div className={`w-14 h-14 rounded-full border-2 ${i === 0 ? "border-primary" : "border-[hsl(14,45%,52%)]"} p-0.5 cursor-pointer`}>
                    {s.avatar ? <img src={s.avatar} alt={s.name} className="w-full h-full rounded-full object-cover" />
                      : <div className="w-full h-full rounded-full bg-primary flex items-center justify-center"><Icon name="Plus" size={18} className="text-primary-foreground" /></div>}
                  </div>
                  <span className="text-xs text-muted-foreground font-body truncate max-w-[56px]">{s.name}</span>
                </div>
              ))}
            </div>

            {postsLoading && (
              <div className="flex justify-center py-10"><Icon name="Loader" size={24} className="text-primary animate-spin" /></div>
            )}

            <div className="space-y-5 mt-2">
              {!postsLoading && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in" style={{ opacity: 0 }}>
                  <div className="text-5xl mb-4">🐾</div>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Пока постов нет</h3>
                  <p className="text-sm font-body text-muted-foreground mb-5">Поделитесь фото своего питомца первым!</p>
                  <button onClick={() => setShowCreatePost(true)} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition-all">
                    Создать пост
                  </button>
                </div>
              )}
              {posts.map((post, i) => (
                <article key={post.id} className="bg-card rounded-2xl overflow-hidden border border-border card-hover animate-fade-in" style={{ animationDelay: `${0.1 + i * 0.1}s`, opacity: 0 }}>
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold overflow-hidden">
                        {post.userAvatar ? <img src={post.userAvatar} alt="" className="w-full h-full object-cover" /> : getInitial(post.userName)}
                      </div>
                      <div className="flex-1">
                        <span className="font-body font-semibold text-sm text-foreground">{post.userName}</span>
                        <span className="text-muted-foreground mx-1.5">·</span>
                        <span className="text-xs font-body text-muted-foreground">{formatTime(post.time)}</span>
                        {post.petName && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs font-body text-primary font-medium">{post.petName}</span>
                            {post.species && <><span className="text-muted-foreground">·</span><span className="text-xs font-body text-muted-foreground">{post.species}</span></>}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-body text-foreground/85 leading-relaxed">{post.text}</p>
                  </div>
                  {post.image && (
                    <div className="relative">
                      <img src={post.image} alt="" className="w-full aspect-[4/3] object-cover" />
                    </div>
                  )}
                  <div className="p-3 flex items-center gap-5">
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-body transition-colors ${post.liked ? "text-[hsl(14,45%,52%)]" : "text-muted-foreground hover:text-[hsl(14,45%,52%)]"}`}>
                      <Icon name="Heart" size={18} className={post.liked ? "fill-[hsl(14,45%,52%)] text-[hsl(14,45%,52%)]" : ""} />
                      {post.likes}
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-body transition-colors ${openComments.has(post.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <Icon name="MessageCircle" size={18} />
                      {post.comments + (postComments[post.id]?.length ? Math.max(0, postComments[post.id].length - post.comments) : 0)}
                    </button>
                    <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Share2" size={16} />
                    </button>
                  </div>

                  {openComments.has(post.id) && (
                    <div className="border-t border-border px-4 pt-3 pb-4 space-y-3 animate-fade-in" style={{ opacity: 0 }}>
                      {(postComments[post.id] || []).map(c => (
                        <div key={c.id} className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-foreground text-xs font-body font-semibold flex-shrink-0 overflow-hidden">
                            {c.userAvatar ? <img src={c.userAvatar} alt="" className="w-full h-full object-cover" /> : getInitial(c.userName)}
                          </div>
                          <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-body font-semibold text-foreground">{c.userName}</span>
                              <span className="text-[10px] font-body text-muted-foreground">{formatTime(c.time)}</span>
                            </div>
                            <p className="text-sm font-body text-foreground/85">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2.5 items-center pt-1">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-body font-semibold flex-shrink-0 overflow-hidden">
                          {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitial(user.name)}
                        </div>
                        <div className="flex-1 flex items-center gap-2 bg-muted/60 rounded-full px-3 py-2">
                          <input value={commentTexts[post.id] || ""}
                            onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") submitComment(post.id); }}
                            placeholder="Написать комментарий..."
                            className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/60 outline-none" />
                          <button onClick={() => submitComment(post.id)} disabled={!(commentTexts[post.id] || "").trim()} className="text-primary disabled:text-muted-foreground/40 transition-colors">
                            <Icon name="SendHorizontal" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* COMMUNITIES TAB */}
        {activeTab === "communities" && (
          <div className="px-4 pt-5">
            <div className="animate-fade-in" style={{ opacity: 0 }}>
              <h2 className="font-display text-3xl font-semibold text-foreground mb-1">Сообщества</h2>
              <p className="text-sm font-body text-muted-foreground mb-5">Найдите единомышленников по породе и виду</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden mb-5 cursor-pointer animate-fade-in delay-100" style={{ opacity: 0 }}>
              <img src={OWNER_IMG} alt="Сообщество" className="w-full h-44 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-body px-2 py-0.5 rounded-full mb-1 inline-block">Топ сообщество</span>
                <h3 className="font-display text-white text-2xl font-semibold">Большие породы</h3>
                <p className="text-white/80 text-sm font-body">21 000 участников</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COMMUNITIES.map((c, i) => (
                <div key={c.id} className={`border rounded-2xl p-4 cursor-pointer card-hover animate-fade-in ${c.color}`} style={{ animationDelay: `${0.15 + i * 0.07}s`, opacity: 0 }}>
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-body font-semibold text-sm leading-tight mb-1">{c.name}</div>
                  <div className="font-body text-xs opacity-70">{c.members} участников</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-2xl border border-dashed border-muted-foreground/40 text-muted-foreground text-sm font-body hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Icon name="Plus" size={16} /> Создать сообщество
            </button>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <div className="px-4 pt-5">
            <div className="animate-fade-in" style={{ opacity: 0 }}>
              <h2 className="font-display text-3xl font-semibold text-foreground mb-1">Поиск питомцев</h2>
              <p className="text-sm font-body text-muted-foreground mb-4">По породе, виду, возрасту и городу</p>
            </div>
            <div className="relative mb-4 animate-fade-in delay-100" style={{ opacity: 0 }}>
              <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Порода, имя или город..."
                className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="flex gap-2 mb-5 animate-fade-in delay-200" style={{ opacity: 0 }}>
              {speciesOptions.map(s => (
                <button key={s} onClick={() => setSearchSpecies(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-body transition-all ${searchSpecies === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {PETS_SEARCH.filter(p => searchSpecies === "Все" || p.type === searchSpecies).map((pet, i) => (
                <div key={pet.id} className="bg-card border border-border rounded-2xl flex overflow-hidden cursor-pointer card-hover animate-fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}>
                  <img src={pet.image} alt={pet.name} className="w-24 h-24 object-cover flex-shrink-0" />
                  <div className="p-3.5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-body font-semibold text-foreground">{pet.name}</span>
                      <span className="text-xs font-body bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{pet.type}</span>
                    </div>
                    <span className="text-sm font-body text-muted-foreground">{pet.breed}</span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs font-body text-muted-foreground"><Icon name="Calendar" size={11} />{pet.age}</div>
                      <div className="flex items-center gap-1 text-xs font-body text-muted-foreground"><Icon name="MapPin" size={11} />{pet.city}</div>
                    </div>
                  </div>
                  <div className="ml-auto pr-4 flex items-center"><Icon name="ChevronRight" size={18} className="text-muted-foreground" /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="animate-fade-in" style={{ opacity: 0 }}>
            <div className="relative">
              <div className="h-36 bg-gradient-to-br from-amber-100 via-orange-50 to-green-50 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 blob-1" style={{ background: "hsla(22,55%,38%,0.15)" }} />
                <div className="absolute -bottom-6 left-8 w-24 h-24 blob-2" style={{ background: "hsla(95,22%,58%,0.2)" }} />
              </div>
              <div className="px-5 -mt-8 pb-4">
                <div className="flex items-end justify-between mb-3">
                  <div className="w-16 h-16 rounded-full bg-primary border-4 border-background flex items-center justify-center text-primary-foreground font-body font-bold text-xl overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitial(user.name)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditProfile({ ...user }); setShowEditProfile(true); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-sm font-body text-foreground hover:border-primary transition-all">
                      <Icon name="Pencil" size={14} /> Редактировать
                    </button>
                    <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive transition-all">
                      <Icon name="LogOut" size={15} />
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{user.name}</h2>
                {user.city && (
                  <div className="flex items-center gap-1 mt-0.5 mb-2">
                    <Icon name="MapPin" size={13} className="text-[hsl(14,45%,52%)]" />
                    <span className="text-sm font-body text-muted-foreground">{user.city}</span>
                  </div>
                )}
                {user.bio && <p className="text-sm font-body text-foreground/70 leading-relaxed mt-2">{user.bio}</p>}
                <div className="flex gap-5 mt-4 pb-4 border-b border-border">
                  {[["0", "публикаций"], ["0", "подписчиков"], ["0", "подписок"]].map(([n, l]) => (
                    <div key={l} className="text-center">
                      <div className="font-display text-xl font-semibold text-foreground">{n}</div>
                      <div className="text-xs font-body text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5">
              <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
                {(["pets", "posts"] as const).map(t => (
                  <button key={t} onClick={() => setProfileTab(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all ${profileTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                    {t === "pets" ? "Мои питомцы" : "Публикации"}
                  </button>
                ))}
              </div>
              {profileTab === "pets" && (
                <div className="space-y-3">
                  <button className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-body hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Icon name="Plus" size={16} /> Добавить питомца
                  </button>
                </div>
              )}
              {profileTab === "posts" && (
                <div className="flex flex-col items-center py-10 text-muted-foreground">
                  <Icon name="Image" size={32} className="mb-2 opacity-40" />
                  <span className="text-sm font-body">Пока нет публикаций</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      {activeTab === "feed" && (
        <button onClick={() => setShowCreatePost(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          style={{ boxShadow: "0 4px 20px hsla(22,55%,38%,0.4)" }}>
          <Icon name="Plus" size={24} />
        </button>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreatePost(false)} />
          <div className="relative w-full max-w-lg bg-background rounded-t-3xl shadow-2xl animate-fade-in" style={{ opacity: 0 }}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
            <div className="px-5 pb-2 pt-1 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-foreground">Новый пост</h3>
              <button onClick={() => setShowCreatePost(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="px-5 pb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitial(user.name)}
                </div>
                <div className="flex-1">
                  <div className="font-body font-semibold text-sm text-foreground">{user.name}</div>
                  <input value={newPostPet} onChange={e => setNewPostPet(e.target.value)} placeholder="Имя питомца..."
                    className="text-xs font-body text-primary bg-transparent border-none outline-none placeholder:text-muted-foreground/60 w-full" />
                </div>
              </div>
              <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Расскажи о своём питомце..." rows={3}
                className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              {newPostImg ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={newPostImg} alt="preview" className="w-full h-48 object-cover" />
                  <button onClick={() => setNewPostImg(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all bg-muted/30">
                  <Icon name="ImagePlus" size={24} /><span className="text-sm font-body">Добавить фото</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <div className="flex gap-3 pt-1">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted text-muted-foreground text-sm font-body hover:bg-accent transition-colors">
                  <Icon name="Camera" size={15} /> Фото
                </button>
                <button onClick={handleCreatePost} disabled={(!newPostText.trim() && !newPostImg) || postLoading}
                  className="ml-auto px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-40 hover:opacity-90 transition-all flex items-center gap-2">
                  {postLoading && <Icon name="Loader" size={14} className="animate-spin" />}
                  Опубликовать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && editProfile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditProfile(false)} />
          <div className="relative w-full max-w-lg bg-background rounded-t-3xl shadow-2xl animate-fade-in" style={{ opacity: 0 }}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
            <div className="px-5 pb-2 pt-1 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-foreground">Редактировать профиль</h3>
              <button onClick={() => setShowEditProfile(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="px-5 pb-8 space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <div onClick={() => avatarInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-primary border-4 border-muted flex items-center justify-center text-primary-foreground font-body font-bold text-2xl overflow-hidden cursor-pointer relative group">
                  {editProfile.avatar ? <img src={editProfile.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitial(editProfile.name)}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="Camera" size={20} className="text-white" />
                  </div>
                </div>
                <span className="text-xs font-body text-muted-foreground">Нажми чтобы сменить фото</span>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Имя</label>
                <input value={editProfile.name} onChange={e => setEditProfile(p => p ? { ...p, name: e.target.value } : p)}
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Город</label>
                <input value={editProfile.city} onChange={e => setEditProfile(p => p ? { ...p, city: e.target.value } : p)}
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">О себе</label>
                <textarea value={editProfile.bio} onChange={e => setEditProfile(p => p ? { ...p, bio: e.target.value } : p)} rows={3}
                  className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              </div>
              <button onClick={saveProfile} disabled={editLoading}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {editLoading && <Icon name="Loader" size={14} className="animate-spin" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-around">
          {([
            { id: "feed", icon: "Home", label: "Лента" },
            { id: "communities", icon: "Users", label: "Сообщества" },
            { id: "search", icon: "Search", label: "Поиск" },
            { id: "profile", icon: "User", label: "Профиль" },
          ] as { id: Tab; icon: string; label: string }[]).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <div className={`relative ${activeTab === item.id ? "scale-110" : ""} transition-transform`}>
                <Icon name={item.icon} size={22} />
                {activeTab === item.id && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
              </div>
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
