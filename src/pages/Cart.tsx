import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [loading, setLoading] = useState(false);

  // Mock cart data - in real app, this would come from context or local storage
  const [cart, setCart] = useState([
    { id: "1", name: "Idli (2 pcs)", price: 30, quantity: 2 },
    { id: "2", name: "Masala Dosa", price: 60, quantity: 1 },
  ]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (!session) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to place an order",
        });
        navigate("/auth?mode=login");
      }
    };
    checkSession();
  }, [navigate, toast]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to place an order",
      });
      navigate("/auth?mode=login");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        items: cart,
        subtotal,
        tax,
        total,
        payment_method: paymentMethod,
        status: "received",
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Order placed!",
        description: "Your order has been received",
      });
      navigate(`/orders/${data.id}`);
    }
    
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold ml-4">Cart</h1>
          </div>
        </header>
        <main className="container py-12 text-center">
          <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
          <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">Cart & Checkout</h1>
        </div>
      </header>

      <main className="container py-6 max-w-2xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpay">Google Pay / UPI</SelectItem>
                  <SelectItem value="phonepe">PhonePe / UPI</SelectItem>
                  <SelectItem value="paytm">Paytm / Wallet</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="netbanking">Netbanking</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cart;
