import { useMemo, useState } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Hash,
  Pin,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreVertical,
  Plus,
  Smile,
  Paperclip,
  ShieldCheck,
  Users,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";

const channels = [
  {
    id: "general",
    name: "General Chat",
    count: 142,
    icon: Hash,
    description: "Everyday team conversations",
  },
  {
    id: "dev",
    name: "Dev Team",
    count: 38,
    icon: Hash,
    description: "Engineering updates and questions",
  },
  {
    id: "design",
    name: "UI/UX Design",
    count: 24,
    icon: Hash,
    description: "Design reviews and inspiration",
  },
  {
    id: "announcements",
    name: "Announcements",
    count: 5,
    icon: Pin,
    description: "Important team news",
  },
];

const initialPosts = [
  {
    id: 1,
    author: "Sarah Jenkins",
    role: "UI/UX Designer",
    avatar: "SJ",
    time: "25 mins ago",
    channel: "design",
    content:
      "Hey everyone! Just dropped the updated Figma design tokens for the WorkSync vendor dashboard. Let me know if you spot any contrast issues with the dark mode toggle.",
    likes: 8,
    comments: 3,
    liked: false,
  },
  {
    id: 2,
    author: "Alex Rivera",
    role: "Backend Engineer",
    avatar: "AR",
    time: "2 hours ago",
    channel: "dev",
    content:
      "Heads up team: The staging server will undergo scheduled maintenance tonight at 11:00 PM IST for authentication database indexing. Expect approximately 10 minutes of downtime.",
    likes: 14,
    comments: 5,
    liked: true,
  },
  {
    id: 3,
    author: "Rouhan",
    role: "Frontend Developer",
    avatar: "R",
    time: "Yesterday",
    channel: "general",
    content:
      "Just pushed the new responsive navigation bar and mobile bottom footer tab component. Feel free to review PR #148 when you have a moment!",
    likes: 21,
    comments: 7,
    liked: false,
  },
];

const avatarStyles = [
  "bg-violet-100 text-violet-700 ring-violet-200",
  "bg-sky-100 text-sky-700 ring-sky-200",
  "bg-teal-100 text-teal-700 ring-teal-200",
  "bg-amber-100 text-amber-700 ring-amber-200",
];

export default function DiscussionPage() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [showComposer, setShowComposer] = useState(false);

  const activeChannelInfo = channels.find(
    (channel) => channel.id === activeChannel
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesChannel = post.channel === activeChannel;

      const matchesSearch =
        !query ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.role.toLowerCase().includes(query);

      return matchesChannel && matchesSearch;
    });
  }, [posts, activeChannel, searchQuery]);

  const handleSendPost = (event) => {
    event.preventDefault();

    const content = newPostContent.trim();

    if (!content) return;

    const newPost = {
      id: Date.now(),
      author: "Rouhan",
      role: "Frontend Developer",
      avatar: "R",
      time: "Just now",
      channel: activeChannel,
      content,
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setNewPostContent("");
    setShowComposer(false);
  };

  const handleLike = (id) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? Math.max(0, post.likes - 1)
                : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "WorkSync Discussion",
          text: post.content,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(post.content);
        alert("Discussion copied to clipboard!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to share discussion:", error);
      }
    }
  };

  const channelPostCount = posts.filter(
    (post) => post.channel === activeChannel
  ).length;

  const totalReactions = posts.reduce(
    (total, post) => total + post.likes,
    0
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-50/70 px-4 py-5 pb-24 text-slate-900 sm:px-6 sm:py-8 lg:px-8 dark:bg-slate-950 dark:text-slate-100">

      {/* ================= PAGE HEADER ================= */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-teal-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

        <div className="pointer-events-none absolute -bottom-24 right-36 h-52 w-52 rounded-full bg-cyan-400/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-50">
              <Sparkles size={14} />
              WorkSync Community
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Discussion Board
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/90 sm:text-base">
              Share progress, ask questions, and keep your team moving forward
              together.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            <Plus size={18} />
            Start a discussion
          </button>
        </div>

        {/* Statistics */}

        <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <MessageSquare size={19} />
            </span>

            <div>
              <p className="text-xl font-extrabold">{posts.length}</p>
              <p className="text-xs text-teal-50/80">Discussions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Users size={19} />
            </span>

            <div>
              <p className="text-xl font-extrabold">24</p>
              <p className="text-xs text-teal-50/80">Team members</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <TrendingUp size={19} />
            </span>

            <div>
              <p className="text-xl font-extrabold">{totalReactions}</p>
              <p className="text-xs text-teal-50/80">Reactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH HEADER ================= */}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">
            Team conversations
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse a channel or search for a conversation.
          </p>
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />

          <input
            type="search"
            placeholder="Search messages or people..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900"
          />
        </label>
      </section>

      {/* ================= MAIN LAYOUT ================= */}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

        {/* CHANNEL SIDEBAR */}

        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400">
              Your channels
            </h3>

            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {channels.length}
            </span>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const isActive = activeChannel === channel.id;

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:w-full ${
                    isActive
                      ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">
                      {channel.name}
                    </span>

                    <span
                      className={`mt-0.5 hidden text-xs lg:block ${
                        isActive
                          ? "text-teal-700/70 dark:text-teal-300/70"
                          : "text-slate-400"
                      }`}
                    >
                      {channel.description}
                    </span>
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-extrabold ${
                      isActive
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {channel.count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 lg:block">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck size={16} className="text-teal-600" />
              Team space
            </div>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Keep conversations helpful, respectful, and focused on moving
              work forward.
            </p>
          </div>
        </aside>

        {/* ================= DISCUSSION FEED ================= */}

        <section className="min-w-0 space-y-4">

          {/* Active Channel */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Hash size={17} />
                </span>

                <h3 className="font-extrabold">
                  {activeChannelInfo?.name}
                </h3>
              </div>

              <p className="mt-1 pl-10 text-xs text-slate-500 dark:text-slate-400">
                {channelPostCount} posts in this channel
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="mr-1">●</span> Team space
            </span>
          </div>

          {/* CREATE POST */}

          <form
            onSubmit={handleSendPost}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-sm font-extrabold text-white shadow-sm">
                R
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  rows={showComposer ? 4 : 2}
                  placeholder={`Share an update with #${activeChannel}...`}
                  value={newPostContent}
                  onFocus={() => setShowComposer(true)}
                  onChange={(event) => setNewPostContent(event.target.value)}
                  className="w-full resize-y rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-200 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:focus:border-teal-900 dark:focus:bg-slate-950"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      title="Attachments (coming soon)"
                      className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800"
                    >
                      <Paperclip size={17} />
                    </button>

                    <button
                      type="button"
                      title="Emoji (coming soon)"
                      className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800"
                    >
                      <Smile size={17} />
                    </button>

                    <span className="ml-2 text-xs">
                      Posting to{" "}
                      <strong className="text-teal-700 dark:text-teal-400">
                        #{activeChannel}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={15} />
                    Post update
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* FEED TITLE */}

          <div className="flex items-center justify-between px-1 pt-1">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
              Recent discussions{" "}
              <span className="ml-1 text-slate-400">
                ({filteredPosts.length})
              </span>
            </h3>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400"
              >
                <X size={13} />
                Clear search
              </button>
            )}
          </div>

          {/* EMPTY STATE */}

          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <MessageSquare size={24} />
              </span>

              <h3 className="mt-4 font-extrabold">
                Nothing here just yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                No discussions match this channel and search. Start a
                conversation or try a different search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowComposer(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
              >
                <Plus size={16} />
                Start a discussion
              </button>
            </div>
          ) : (
            filteredPosts.map((post, index) => {
              const channel = channels.find(
                (item) => item.id === post.channel
              );

              const avatarStyle = avatarStyles[index % avatarStyles.length];

              return (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md hover:shadow-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-900 sm:p-5"
                >
                  {/* Author */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ring-1 ${avatarStyle}`}
                      >
                        {post.avatar}
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 dark:text-white">
                            {post.author}
                          </h4>

                          <ShieldCheck
                            size={15}
                            className="text-teal-600 dark:text-teal-400"
                          />

                          {post.author === "Rouhan" && (
                            <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {post.role}
                          <span className="mx-1 text-slate-300">•</span>
                          {post.time}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="More post options"
                      title="More options (coming soon)"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Post content */}

                  <div className="mt-4 pl-0 sm:pl-14">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {post.content}
                    </p>

                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {channel?.id === "announcements" ? (
                          <Pin size={13} />
                        ) : (
                          <Hash size={13} />
                        )}
                        {channel?.name}
                      </span>
                    </div>

                    {/* Actions */}

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        aria-pressed={post.liked}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                          post.liked
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                            : "text-slate-500 hover:bg-slate-50 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ThumbsUp
                          size={15}
                          className={post.liked ? "fill-current" : ""}
                        />
                        {post.likes}
                        <span className="hidden sm:inline">Likes</span>
                      </button>

                      <button
                        type="button"
                        title="Comments (coming soon)"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <MessageCircle size={15} />
                        {post.comments}
                        <span className="hidden sm:inline">Comments</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(post)}
                        className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Share2 size={15} />
                        Share
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}