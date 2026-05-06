import { useState } from "react";
import type { MenuItem } from "@/lib/menu-data";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomizeDialog from "@/components/CustomizeDialog";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const hasCustomizations = item.customizations && item.customizations.length > 0;

  const handleQuickAdd = () => {
    addItem(item);
    toast({ title: `${item.name} added`, description: "Check your cart to review." });
  };

  return (
    <>
      <Card className="group shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border-border/40 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-4xl flex-shrink-0 mt-1">{item.image}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg text-foreground leading-tight">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-body font-semibold text-primary">₱{item.price.toFixed(2)}</span>
                <div className="flex gap-1">
                  {hasCustomizations && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCustomizeOpen(true)}
                      className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Customize
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={hasCustomizations ? "ghost" : "outline"}
                    onClick={handleQuickAdd}
                    className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {hasCustomizations && (
        <CustomizeDialog item={item} open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
      )}
    </>
  );
};

export default MenuCard;
