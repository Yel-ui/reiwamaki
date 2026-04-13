import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
};

export default Index;
