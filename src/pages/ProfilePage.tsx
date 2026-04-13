import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-heading">My Profile</h1>
        </div>
      </header>

      <main className="container py-6 max-w-md space-y-6">
        <Card>
          <CardHeader className="items-center text-center pb-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading text-2xl">{user?.name || "Guest"}</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email || "guest@example.com"}</p>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              Total Orders: <span className="font-semibold text-foreground">{orders.length}</span>
            </div>

            <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
