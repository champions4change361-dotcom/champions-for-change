import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  type: 'merchandise' | 'ticket';
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    playerName?: string;
    playerNumber?: string;
    customFields?: Record<string, string>;
  };
}

interface ShoppingCartProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function ShoppingCart({ className = '', variant = 'default' }: ShoppingCartProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, user]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              totalPrice: item.unitPrice * newQuantity 
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const existingItemIndex = cartItems.findIndex(
      cartItem => 
        cartItem.productId === item.productId && 
        cartItem.variantId === item.variantId &&
        cartItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = cartItems[existingItemIndex];
      updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.type}_${item.productId}_${item.variantId || 'default'}_${Date.now()}`,
      };
      setCartItems(items => [...items, newItem]);
    }

    toast({
      title: "Added to cart",
      description: `${item.productName} has been added to your cart`,
    });
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // TODO: Integrate with existing checkout system
    // For now, just show a placeholder
    toast({
      title: "Checkout Coming Soon",
      description: "Checkout functionality will be integrated with the existing payment system",
    });
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  const CartButton = () => (
    <Button
      variant="ghost"
      size={variant === 'compact' ? 'sm' : 'default'}
      className={`relative ${className}`}
      data-testid="button-shopping-cart"
    >
      <CartIcon className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          data-testid="badge-cart-count"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      {variant !== 'compact' && (
        <span className="ml-2 hidden sm:inline">Cart</span>
      )}
    </Button>
  );

  const CartContent = () => (
    <Card className="w-80 max-h-96 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            Shopping Cart
          </span>
          {cartItems.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
              data-testid="button-clear-cart"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CartIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Your cart is empty</p>
            <p className="text-sm">Add some items to get started!</p>
          </div>
        ) : (
          <>
            <div className="max-h-48 overflow-y-auto space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" data-testid={`text-item-name-${item.id}`}>
                      {item.productName}
                    </h4>
                    {item.variantName && (
                      <p className="text-xs text-gray-500">{item.variantName}</p>
                    )}
                    {item.customization?.playerName && (
                      <p className="text-xs text-blue-600">
                        Name: {item.customization.playerName}
                        {item.customization.playerNumber && ` #${item.customization.playerNumber}`}
                      </p>
                    )}
                    <p className="text-sm font-medium text-green-600">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="text-sm w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center font-medium">
                <span>Total ({totalItems} items):</span>
                <span className="text-green-600" data-testid="text-total-price">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              
              <Button 
                className="w-full" 
                onClick={proceedToCheckout}
                disabled={isLoading || cartItems.length === 0}
                data-testid="button-checkout"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CartButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <CartContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for other components to add items to cart
export const useShoppingCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
    }
  }, [user]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    if (!user) return;

    const savedCart = localStorage.getItem(`cart_${user.id}`) || '[]';
    const currentItems: CartItem[] = JSON.parse(savedCart);
    
    const existingItemIndex = currentItems.findIndex(
      cartItem => 
        cartItem.productId === item.productId && 
        cartItem.variantId === item.variantId &&
        cartItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      currentItems[existingItemIndex].quantity += item.quantity;
      currentItems[existingItemIndex].totalPrice = 
        currentItems[existingItemIndex].unitPrice * currentItems[existingItemIndex].quantity;
    } else {
      const newItem: CartItem = {
        ...item,
        id: `${item.type}_${item.productId}_${item.variantId || 'default'}_${Date.now()}`,
      };
      currentItems.push(newItem);
    }

    localStorage.setItem(`cart_${user.id}`, JSON.stringify(currentItems));
    setCartItems(currentItems);

    // Trigger a custom event to update other cart components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  return {
    cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    addToCart,
  };
};