import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, LogOut, Phone, MapPin, Save, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone, address })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Saved!", description: "Profile updated successfully." });
    }
    setSaving(false);
  };

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
            <h2 className="font-heading text-2xl">{profile?.name || "Guest"}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email || "—"}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label htmlFor="pName" className="flex items-center gap-1"><User className="h-3 w-3" /> Name</Label>
                <Input id="pName" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label htmlFor="pPhone" className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <Input id="pPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" maxLength={15} />
              </div>
              <div>
                <Label htmlFor="pAddr" className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Default Address</Label>
                <Input id="pAddr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your delivery address" maxLength={300} />
              </div>
              <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
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
