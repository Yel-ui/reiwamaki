import type { MenuItem } from "@/lib/menu-data";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addItem(item);
    toast({ title: `${item.name} added`, description: "Check your cart to review." });
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/40 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl flex-shrink-0 mt-1">{item.image}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg text-foreground leading-tight">{item.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-body font-semibold text-primary">₱{item.price.toFixed(2)}</span>
              <Button size="sm" variant="outline" onClick={handleAdd} className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
