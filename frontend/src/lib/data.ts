import {
  Code,
  Sparkles,
  Clock,
  Languages,
  Moon,
  Link2,
  Heart,
  Hash,
} from "lucide-react";

const app = {
  features: [
    {
      icon: Code,
      key: "syntax_highlighting",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Sparkles,
      key: "ai_detection",
      gradient: "from-pink-500 to-rose-500",
    },
    { icon: Hash, key: "custom_ids", gradient: "from-cyan-500 to-blue-500" },
    {
      icon: Clock,
      key: "expiration",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Languages,
      key: "multi_language",
      gradient: "from-emerald-500 to-teal-500",
    },
    { icon: Moon, key: "dark_mode", gradient: "from-slate-500 to-zinc-600" },
    { icon: Heart, key: "open_source", gradient: "from-red-500 to-pink-500" },
    {
      icon: Link2,
      key: "redirect_urls",
      gradient: "from-indigo-500 to-purple-500",
    },
  ],
  team: [
    {
      name: "Tejas Chaudhari",
      email: "jaybalaji192@gmail.com",
      github: "https://github.com/tejaschaudhari192",
      avatar:
        "https://avatars.githubusercontent.com/u/104405128?s=400&u=1285d0293657159a9e85e0709ee549c37198667e&v=4",
    },
    {
      name: "Durgesh Kapade",
      email: "durgeshkapade26@gmail.com",
      github: "https://github.com/durgeshkapade",
      avatar: "https://avatars.githubusercontent.com/u/135988213?v=4",
    },
  ],
};

export default app;
