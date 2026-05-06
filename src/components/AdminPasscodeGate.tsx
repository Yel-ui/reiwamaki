import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSCODE = "2580";
const STORAGE_KEY = "admin_passcode_ok";

interface Props {
  children: React.ReactNode;
}

const AdminPasscodeGate = ({ children }: Props) => {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  const submit = () => {
    if (code === ADMIN_PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      toast.success("Access granted");
    } else {
      toast.error("Incorrect passcode");
      setCode("");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative z-10">
      <Card className="p-8 w-full max-w-md text-center space-y-6 border-border/60 shadow-2xl bg-card/90 backdrop-blur">
        <div className="flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-heading">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Enter the 4-digit passcode to continue.</p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={code}
            onChange={setCode}
            onComplete={(v) => { if (v.length === 4) submit(); }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button className="flex-1" onClick={submit} disabled={code.length !== 4}>
            Unlock
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPasscodeGate;
