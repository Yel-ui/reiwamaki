import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { categories, menuItems } from "@/lib/menu-data";
import MenuCard from "@/components/MenuCard";
import CartSheet from "@/components/CartSheet";
import { Button } from "@/components/ui/button";
import { LogOut, Search, ClipboardList, UserCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import SakuraPetals from "@/components/SakuraPetals";
import SushiMascot from "@/components/SushiMascot";

const Dashboard = () => {
  const { profile, logout } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = menuItems.filter((item) => {
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SakuraPetals count={30} />
      <div className="relative z-10">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <h1 className="text-xl font-heading text-foreground">Rei Wa Maki</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hello, <span className="text-foreground font-medium">{profile?.name || "Guest"}</span>
            </span>
            <CartSheet />
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} title="Admin">
                <Shield className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} title="My Orders">
              <ClipboardList className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Profile">
              <UserCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-cherry-light to-secondary p-6 md:p-8 animate-fade-in shadow-xl">
          <h2 className="text-3xl md:text-4xl font-heading text-foreground">
            Fresh sushi, delivered to you 🍣
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Browse our menu, add your favorites to the cart, and place your order in seconds.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </main>
      </div>
      <SushiMascot />
    </div>
  );
};

export default Dashboard;
