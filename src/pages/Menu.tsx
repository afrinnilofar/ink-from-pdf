import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Veg",
    "Non-Veg",
    "Tea & Coffee",
    "Snacks",
    "Ice Creams",
    "Savouries",
    "Beverages",
    "Cold Drinks",
    "Fresh Juices",
    "Desserts",
  ];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading menu",
        description: error.message,
      });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    navigate("/");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">MEC Canteen</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth?mode=login")}>Log in</Button>
            )}
            <Button
              variant="default"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="Veg" className="w-full">
          <TabsList className="w-full flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="flex-1 min-w-[100px]">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <p>Loading menu...</p>
                ) : (
                  menuItems
                    .filter((item) => item.category.toLowerCase() === category.toLowerCase())
                    .map((item) => (
                      <Card key={item.id}>
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">₹{item.price}</p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                          >
                            {item.available ? "Add to Cart" : "Unavailable"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                )}
                {!loading &&
                  menuItems.filter((item) => item.category.toLowerCase() === category.toLowerCase())
                    .length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No items available in this category yet
                    </p>
                  )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="container flex items-center justify-between">
            <div>
              <p className="font-semibold">{cartItemCount} items</p>
              <p className="text-2xl font-bold">₹{cartTotal}</p>
            </div>
            <Button size="lg" onClick={() => navigate("/cart")}>
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
