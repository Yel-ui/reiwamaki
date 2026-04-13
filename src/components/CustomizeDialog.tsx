import { useState } from "react";
import type { MenuItem, ItemCustomization } from "@/lib/menu-data";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
}

const CustomizeDialog = ({ item, open, onClose }: Props) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selections, setSelections] = useState<ItemCustomization>({});
  const [instructions, setInstructions] = useState("");

  const extraCost = (item.customizations || []).reduce((sum, opt) => {
    const chosen = opt.choices.find((c) => c.value === selections[opt.id]);
    return sum + (chosen?.extra || 0);
  }, 0);

  const handleAdd = () => {
    addItem(item, selections, instructions);
    toast({ title: `${item.name} added`, description: "Customized to your liking!" });
    setSelections({});
    setInstructions("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <span className="text-3xl">{item.image}</span>
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{item.description}</p>
        <p className="font-body font-semibold text-primary">
          ₱{(item.price + extraCost).toFixed(2)}
          {extraCost > 0 && (
            <span className="text-xs text-muted-foreground ml-1">(+₱{extraCost.toFixed(2)})</span>
          )}
        </p>

        {item.customizations && item.customizations.length > 0 && (
          <div className="space-y-4 mt-2">
            {item.customizations.map((opt) => (
              <div key={opt.id}>
                <Label className="text-sm font-medium">{opt.label}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {opt.choices.map((choice) => (
                    <Button
                      key={choice.value}
                      type="button"
                      size="sm"
                      variant={selections[opt.id] === choice.value ? "default" : "outline"}
                      className="text-xs"
                      onClick={() =>
                        setSelections((s) => ({ ...s, [opt.id]: choice.value }))
                      }
                    >
                      {choice.label}
                      {choice.extra ? ` +₱${choice.extra}` : ""}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2">
          <Label className="text-sm font-medium">Special Instructions</Label>
          <Textarea
            placeholder="e.g. No wasabi, extra ginger..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1.5 resize-none"
            rows={2}
            maxLength={200}
          />
        </div>

        <Button className="w-full mt-2" onClick={handleAdd}>
          Add to Cart — ₱{(item.price + extraCost).toFixed(2)}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeDialog;
