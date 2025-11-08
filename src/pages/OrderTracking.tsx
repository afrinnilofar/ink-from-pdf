import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const stages = [
    { id: "received", label: "Received" },
    { id: "preparing", label: "Preparing" },
    { id: "ready", label: "Ready" },
    { id: "out_for_delivery", label: "Out for delivery" },
    { id: "delivered", label: "Delivered" },
  ];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading order",
        description: error.message,
      });
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold ml-4">Order Status</h1>
          </div>
        </header>
        <main className="container py-12 text-center">
          <p className="text-xl text-muted-foreground">Order not found</p>
        </main>
      </div>
    );
  }

  const currentStageIndex = stages.findIndex(s => s.id === order.status);
  const progressValue = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">Order Status</h1>
        </div>
      </header>

      <main className="container py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                        index <= currentStageIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs">{stage.label}</p>
                  </div>
                ))}
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Estimated delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {order.eta
                      ? new Date(order.eta).toLocaleTimeString()
                      : "Calculating..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Delivery location</p>
                  <p className="text-sm text-muted-foreground">
                    Your current campus location
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Order items</p>
              <div className="space-y-2">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> You can pre-order your meal for a specific pickup time
              to skip the queue!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderTracking;
