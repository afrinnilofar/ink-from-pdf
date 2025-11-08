import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">MEC Canteen</h1>
          <p className="text-muted-foreground">
            Order from campus stalls — fast, secure & simple
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate("/auth?mode=login")}
          >
            Log in
          </Button>
          
          <Button 
            className="w-full" 
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Sign up
          </Button>
          
          <Button 
            className="w-full" 
            variant="ghost"
            onClick={() => navigate("/menu")}
          >
            Browse menu as guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
