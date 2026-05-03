import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const DOG_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/22e70b04-2a5d-476e-abe9-5024ae3850fc.jpg";
const CAT_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/d729877a-2748-40b1-a4c3-63b107f0302e.jpg";
const RABBIT_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/0da7b96f-1cf1-426d-9f4a-1551dea68775.jpg";
const OWNER_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/f364a9d1-93a9-49e0-ac1c-4cdfa628821b.jpg";

const POSTS = [
  {
    id: 1,
    user: "Алина М.",
    avatar: "А",
    avatarBg: "bg-[#c8a97a]",
    petName: "Барон",
    species: "Золотистый ретривер",
    location: "Москва",
    time: "2 часа назад",
    text: "Сегодня с Бароном нашли новый маршрут в Сокольниках — он был в восторге от осенних листьев! 🍂",
    image: DOG_IMG,
    likes: 84,
    comments: 12,
  },
  {
    id: 2,
    user: "Дмитрий К.",
    avatar: "Д",
    avatarBg: "bg-[#8fa87a]",
    petName: "Луна",
    species: "Британская кошка",
    location: "Санкт-Петербург",
    time: "5 часов назад",
    text: "Луна освоила новое место для сна — прямо у окна с видом на дождь. Говорит, вдохновляет.",
    image: CAT_IMG,
    likes: 127,
    comments: 23,
  },
  {
    id: 3,
    user: "Мария С.",
    avatar: "М",
    avatarBg: "bg-[#c87a7a]",
    petName: "Снежок",
    species: "Карликовый кролик",
    location: "Екатеринбург",
    time: "1 день назад",
    text: "Снежок первый раз вышел в сад — сначала боялся, а потом не хотел возвращаться домой!",
    image: RABBIT_IMG,
    likes: 56,
    comments: 8,
  },
];

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

interface Post {
  id: number;
  user: string;
  avatar: string;
  avatarBg: string;
  petName: string;
  species: string;
  location: string;
  time: string;
  text: string;
  image: string;
  likes: number;
  comments: number;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [searchSpecies, setSearchSpecies] = useState("Все");
  const [profileTab, setProfileTab] = useState<"pets" | "posts">("pets");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<Post[]>(POSTS);

  const [newPostText, setNewPostText] = useState("");
  const [newPostPet, setNewPostPet] = useState("");
  const [newPostImg, setNewPostImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!newPostText.trim() && !newPostImg) return;
    const post: Post = {
      id: Date.now(),
      user: "Алина М.",
      avatar: "А",
      avatarBg: "bg-[#c8a97a]",
      petName: newPostPet || "Питомец",
      species: "Мой питомец",
      location: "Москва",
      time: "только что",
      text: newPostText,
      image: newPostImg || DOG_IMG,
      likes: 0,
      comments: 0,
    };
    setPosts(prev => [post, ...prev]);
    setNewPostText("");
    setNewPostPet("");
    setNewPostImg(null);
    setShowCreatePost(false);
  };

  const speciesOptions = ["Все", "Собака", "Кошка", "Кролик"];

  const BG_IMG = "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/9543ece1-9a29-4302-9a82-cd82c7165b4d.jpg";

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${BG_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: 'hsla(35,25%,97%,0.55)' }} />
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
            <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold text-sm">
              А
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto pb-24">

        {/* FEED TAB */}
        {activeTab === "feed" && (
          <div className="px-4 pt-5 space-y-1">
            {/* Stories row */}
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
              {[
                { name: "Вы", avatar: "А", isImg: false },
                { name: "Барон", avatar: DOG_IMG, isImg: true },
                { name: "Луна", avatar: CAT_IMG, isImg: true },
                { name: "Снежок", avatar: RABBIT_IMG, isImg: true },
                { name: "Бобик", avatar: "https://cdn.poehali.dev/projects/0f7748fd-e817-4818-b926-8236fdda06de/files/d4613076-e102-4cb4-bff4-46474844696f.jpg", isImg: true },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                  <div className={`w-14 h-14 rounded-full border-2 ${i === 0 ? 'border-primary' : 'border-[hsl(14,45%,52%)]'} p-0.5 cursor-pointer`}>
                    {s.isImg ? (
                      <img src={s.avatar} alt={s.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                        <Icon name="Plus" size={18} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-body truncate max-w-[56px]">{s.name}</span>
                </div>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-5 mt-2">
              {posts.map((post, i) => (
                <article
                  key={post.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border card-hover animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.12}s`, opacity: 0 }}
                >
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${post.avatarBg} flex items-center justify-center text-white font-body font-semibold`}>
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-body font-semibold text-sm text-foreground">{post.user}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs font-body text-muted-foreground">{post.time}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Icon name="MapPin" size={11} className="text-[hsl(14,45%,52%)]" />
                          <span className="text-xs font-body text-muted-foreground">{post.location}</span>
                          <span className="text-muted-foreground mx-1">·</span>
                          <span className="text-xs font-body text-primary font-medium">{post.petName}</span>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name="MoreHorizontal" size={18} />
                      </button>
                    </div>
                    <p className="mt-3 text-sm font-body text-foreground/85 leading-relaxed">{post.text}</p>
                  </div>
                  <div className="relative">
                    <img src={post.image} alt={post.petName} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-body px-2.5 py-1 rounded-full">
                        {post.species}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center gap-5">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-body transition-colors ${likedPosts.has(post.id) ? 'text-[hsl(14,45%,52%)]' : 'text-muted-foreground hover:text-[hsl(14,45%,52%)]'}`}
                    >
                      <Icon
                        name="Heart"
                        size={18}
                        className={likedPosts.has(post.id) ? "fill-[hsl(14,45%,52%)] text-[hsl(14,45%,52%)]" : ""}
                      />
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="MessageCircle" size={18} />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors ml-auto">
                      <Icon name="Share2" size={16} />
                    </button>
                  </div>
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

            {/* Featured community */}
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
                <div
                  key={c.id}
                  className={`border rounded-2xl p-4 cursor-pointer card-hover animate-fade-in ${c.color}`}
                  style={{ animationDelay: `${0.15 + i * 0.07}s`, opacity: 0 }}
                >
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-body font-semibold text-sm leading-tight mb-1">{c.name}</div>
                  <div className="font-body text-xs opacity-70">{c.members} участников</div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 rounded-2xl border border-dashed border-muted-foreground/40 text-muted-foreground text-sm font-body hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Icon name="Plus" size={16} />
              Создать сообщество
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

            {/* Search input */}
            <div className="relative mb-4 animate-fade-in delay-100" style={{ opacity: 0 }}>
              <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Порода, имя или город..."
                className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-5 animate-fade-in delay-200" style={{ opacity: 0 }}>
              {speciesOptions.map(s => (
                <button
                  key={s}
                  onClick={() => setSearchSpecies(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-body transition-all ${searchSpecies === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 mb-5 animate-fade-in delay-300" style={{ opacity: 0 }}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-body text-muted-foreground hover:border-primary transition-all">
                <Icon name="MapPin" size={13} />
                Любой город
                <Icon name="ChevronDown" size={13} />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-body text-muted-foreground hover:border-primary transition-all">
                <Icon name="Calendar" size={13} />
                Возраст
                <Icon name="ChevronDown" size={13} />
              </button>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {PETS_SEARCH.filter(p => searchSpecies === "Все" || p.type === searchSpecies).map((pet, i) => (
                <div
                  key={pet.id}
                  className="bg-card border border-border rounded-2xl flex overflow-hidden cursor-pointer card-hover animate-fade-in"
                  style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}
                >
                  <img src={pet.image} alt={pet.name} className="w-24 h-24 object-cover flex-shrink-0" />
                  <div className="p-3.5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-body font-semibold text-foreground">{pet.name}</span>
                      <span className="text-xs font-body bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{pet.type}</span>
                    </div>
                    <span className="text-sm font-body text-muted-foreground">{pet.breed}</span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                        <Icon name="Calendar" size={11} />
                        {pet.age}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                        <Icon name="MapPin" size={11} />
                        {pet.city}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto pr-4 flex items-center">
                    <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="animate-fade-in" style={{ opacity: 0 }}>
            {/* Hero */}
            <div className="relative">
              <div className="h-36 bg-gradient-to-br from-amber-100 via-orange-50 to-green-50 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 blob-1" style={{ background: 'hsla(22,55%,38%,0.15)' }} />
                <div className="absolute -bottom-6 left-8 w-24 h-24 blob-2" style={{ background: 'hsla(95,22%,58%,0.2)' }} />
              </div>
              <div className="px-5 -mt-8 pb-4">
                <div className="flex items-end justify-between mb-3">
                  <div className="w-16 h-16 rounded-full bg-primary border-4 border-background flex items-center justify-center text-primary-foreground font-body font-bold text-xl">
                    А
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-sm font-body text-foreground hover:border-primary transition-all">
                    <Icon name="Settings" size={14} />
                    Настройки
                  </button>
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Алина Михайлова</h2>
                <div className="flex items-center gap-1 mt-0.5 mb-2">
                  <Icon name="MapPin" size={13} className="text-[hsl(14,45%,52%)]" />
                  <span className="text-sm font-body text-muted-foreground">Москва</span>
                </div>
                <p className="text-sm font-body text-foreground/70 leading-relaxed">Люблю природу, животных и долгие прогулки. Хозяйка Барона уже 3 года 🐾</p>

                <div className="flex gap-5 mt-4 pb-4 border-b border-border">
                  {[["128", "публикаций"], ["2 340", "подписчиков"], ["186", "подписок"]].map(([n, l]) => (
                    <div key={l} className="text-center">
                      <div className="font-display text-xl font-semibold text-foreground">{n}</div>
                      <div className="text-xs font-body text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile tabs */}
            <div className="px-5">
              <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
                {(["pets", "posts"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setProfileTab(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all ${profileTab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    {t === "pets" ? "Мои питомцы" : "Публикации"}
                  </button>
                ))}
              </div>

              {profileTab === "pets" && (
                <div className="space-y-3">
                  {[
                    { name: "Барон", breed: "Золотистый ретривер", age: "3 года", image: DOG_IMG, desc: "Добрый и активный. Обожает мячик и купание в реке." },
                  ].map(pet => (
                    <div key={pet.name} className="bg-card border border-border rounded-2xl overflow-hidden card-hover">
                      <img src={pet.image} alt={pet.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display text-xl font-semibold">{pet.name}</h3>
                          <span className="text-xs font-body bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">{pet.age}</span>
                        </div>
                        <p className="text-sm font-body text-primary font-medium mb-2">{pet.breed}</p>
                        <p className="text-sm font-body text-foreground/70">{pet.desc}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-body hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить питомца
                  </button>
                </div>
              )}

              {profileTab === "posts" && (
                <div className="grid grid-cols-3 gap-1.5">
                  {[DOG_IMG, CAT_IMG, RABBIT_IMG, DOG_IMG, CAT_IMG, DOG_IMG].map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FAB — Create post */}
      {activeTab === "feed" && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          style={{ boxShadow: '0 4px 20px hsla(22,55%,38%,0.4)' }}
        >
          <Icon name="Plus" size={24} />
        </button>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreatePost(false)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-background rounded-t-3xl shadow-2xl animate-fade-in" style={{ opacity: 0 }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-2 pt-1 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-foreground">Новый пост</h3>
              <button onClick={() => setShowCreatePost(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-4">
              {/* User row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c8a97a] flex items-center justify-center text-white font-body font-semibold">А</div>
                <div>
                  <div className="font-body font-semibold text-sm text-foreground">Алина М.</div>
                  <input
                    value={newPostPet}
                    onChange={e => setNewPostPet(e.target.value)}
                    placeholder="Имя питомца..."
                    className="text-xs font-body text-primary bg-transparent border-none outline-none placeholder:text-muted-foreground/60 w-full"
                  />
                </div>
              </div>

              {/* Text */}
              <textarea
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                placeholder="Расскажи о своём питомце..."
                rows={3}
                className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />

              {/* Image preview / upload */}
              {newPostImg ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={newPostImg} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setNewPostImg(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all bg-muted/30"
                >
                  <Icon name="ImagePlus" size={24} />
                  <span className="text-sm font-body">Добавить фото</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted text-muted-foreground text-sm font-body hover:bg-accent transition-colors"
                >
                  <Icon name="Camera" size={15} />
                  Фото
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() && !newPostImg}
                  className="ml-auto px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
                >
                  Опубликовать
                </button>
              </div>
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
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className={`relative ${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>
                <Icon name={item.icon} size={22} />
                {activeTab === item.id && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}