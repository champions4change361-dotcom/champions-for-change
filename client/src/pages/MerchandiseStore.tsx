import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingCart } from '@/components/ShoppingCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Plus, Shirt, Trophy, Package, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'style' | 'custom';
  priceAdjustment: number;
  inventory: number;
  sku?: string;
}

interface Product {
  id: string;
  organizationId: string;
  tournamentId?: string;
  name: string;
  description?: string;
  category: 'apparel' | 'accessories' | 'equipment' | 'digital' | 'food_beverage' | 'custom';
  subCategory?: string;
  basePrice: number;
  variants: ProductVariant[];
  images: string[];
  isActive: boolean;
  inventory: number;
  maxQuantityPerOrder: number;
  customizationOptions?: {
    allowNamePersonalization: boolean;
    allowNumberPersonalization: boolean;
    personalizationFee: number;
    customFields: Array<{
      fieldName: string;
      fieldType: 'text' | 'number' | 'select' | 'multiselect';
      required: boolean;
      options?: string[];
    }>;
  };
}

const categoryIcons = {
  apparel: Shirt,
  accessories: Star,
  equipment: Package,
  digital: Trophy,
  food_beverage: Package,
  custom: Package,
};

const categoryColors = {
  apparel: 'bg-blue-500',
  accessories: 'bg-purple-500',
  equipment: 'bg-green-500',
  digital: 'bg-yellow-500',
  food_beverage: 'bg-red-500',
  custom: 'bg-gray-500',
};

export default function MerchandiseStore() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<{
    playerName?: string;
    playerNumber?: string;
    customFields?: Record<string, string>;
  }>({});

  // Fetch products for the user's organization
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/webstore/products'],
    enabled: isAuthenticated && !!user?.organizationId,
  });

  // Fetch products from sample tournament merchandise templates for demo
  const sampleProducts: Product[] = [
    {
      id: 'demo-tshirt',
      organizationId: user?.organizationId || 'demo',
      name: 'Tournament T-Shirt',
      description: 'High-quality cotton tournament t-shirt with team logo',
      category: 'apparel',
      subCategory: 't-shirts',
      basePrice: 15.99,
      variants: [
        { id: 'ys', name: 'Youth Small', type: 'size', priceAdjustment: -2, inventory: 25 },
        { id: 'ym', name: 'Youth Medium', type: 'size', priceAdjustment: -2, inventory: 30 },
        { id: 'yl', name: 'Youth Large', type: 'size', priceAdjustment: -2, inventory: 20 },
        { id: 'as', name: 'Adult Small', type: 'size', priceAdjustment: 0, inventory: 15 },
        { id: 'am', name: 'Adult Medium', type: 'size', priceAdjustment: 0, inventory: 25 },
        { id: 'al', name: 'Adult Large', type: 'size', priceAdjustment: 0, inventory: 20 },
        { id: 'axl', name: 'Adult XL', type: 'size', priceAdjustment: 2, inventory: 10 },
        { id: 'axxl', name: 'Adult XXL', type: 'size', priceAdjustment: 4, inventory: 5 },
      ],
      images: [],
      isActive: true,
      inventory: 150,
      maxQuantityPerOrder: 10,
      customizationOptions: {
        allowNamePersonalization: true,
        allowNumberPersonalization: true,
        personalizationFee: 5.00,
        customFields: []
      }
    },
    {
      id: 'demo-hoodie',
      organizationId: user?.organizationId || 'demo',
      name: 'Tournament Hoodie',
      description: 'Warm and comfortable hoodie perfect for cool tournament days',
      category: 'apparel',
      subCategory: 'hoodies',
      basePrice: 32.99,
      variants: [
        { id: 'ym', name: 'Youth Medium', type: 'size', priceAdjustment: -5, inventory: 15 },
        { id: 'yl', name: 'Youth Large', type: 'size', priceAdjustment: -5, inventory: 12 },
        { id: 'as', name: 'Adult Small', type: 'size', priceAdjustment: 0, inventory: 10 },
        { id: 'am', name: 'Adult Medium', type: 'size', priceAdjustment: 0, inventory: 15 },
        { id: 'al', name: 'Adult Large', type: 'size', priceAdjustment: 0, inventory: 12 },
        { id: 'axl', name: 'Adult XL', type: 'size', priceAdjustment: 3, inventory: 8 },
        { id: 'axxl', name: 'Adult XXL', type: 'size', priceAdjustment: 6, inventory: 5 },
      ],
      images: [],
      isActive: true,
      inventory: 77,
      maxQuantityPerOrder: 5,
    },
    {
      id: 'demo-water-bottle',
      organizationId: user?.organizationId || 'demo',
      name: 'Water Bottle',
      description: 'Stay hydrated with our premium tournament water bottle',
      category: 'accessories',
      subCategory: 'drinkware',
      basePrice: 12.99,
      variants: [],
      images: [],
      isActive: true,
      inventory: 50,
      maxQuantityPerOrder: 3,
      customizationOptions: {
        allowNamePersonalization: true,
        allowNumberPersonalization: false,
        personalizationFee: 3.00,
        customFields: []
      }
    },
    {
      id: 'demo-program',
      organizationId: user?.organizationId || 'demo',
      name: 'Digital Tournament Program',
      description: 'Complete tournament information and bracket details',
      category: 'digital',
      basePrice: 4.99,
      variants: [],
      images: [],
      isActive: true,
      inventory: 999,
      maxQuantityPerOrder: 1,
    }
  ];

  // Use sample products for demo purposes - ensure type safety
  const displayProducts: Product[] = Array.isArray(products) && products.length > 0 ? products : sampleProducts;

  const getPrice = (product: Product, variant?: ProductVariant) => {
    const basePrice = product.basePrice;
    const variantAdjustment = variant?.priceAdjustment || 0;
    const customizationFee = (customization.playerName || customization.playerNumber) 
      ? (product.customizationOptions?.personalizationFee || 0) 
      : 0;
    return basePrice + variantAdjustment + customizationFee;
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !isAuthenticated) return;

    // Validate inputs before adding to cart
    if (quantity <= 0 || quantity > selectedProduct.maxQuantityPerOrder) {
      toast({
        title: "Invalid quantity",
        description: `Please select a quantity between 1 and ${selectedProduct.maxQuantityPerOrder}`,
        variant: "destructive",
      });
      return;
    }

    const finalPrice = getPrice(selectedProduct, selectedVariant || undefined);
    
    addToCart({
      type: 'merchandise',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      quantity,
      unitPrice: finalPrice,
      totalPrice: finalPrice * quantity,
      customization: Object.keys(customization).length > 0 ? customization : undefined,
    });

    toast({
      title: "Added to cart!",
      description: `${selectedProduct.name} has been added to your cart`,
    });

    // Reset form
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setCustomization({});
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const IconComponent = categoryIcons[product.category];
    
    return (
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-product-${product.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${categoryColors[product.category]} text-white`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="mb-3" data-testid={`text-product-description-${product.id}`}>
            {product.description}
          </CardDescription>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-green-600" data-testid={`text-product-price-${product.id}`}>
                ${product.basePrice.toFixed(2)}
              </span>
              {product.variants.length > 0 && (
                <span className="text-sm text-gray-500 ml-1">+ variants</span>
              )}
            </div>
            <Badge variant="outline" data-testid={`text-product-inventory-${product.id}`}>
              {product.inventory} in stock
            </Badge>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full group-hover:bg-green-600 transition-colors" 
                onClick={() => setSelectedProduct(product)}
                data-testid={`button-view-product-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add {product.name} to Cart</DialogTitle>
                <DialogDescription>
                  Configure your item before adding it to your cart.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Variants Selection */}
                {product.variants.length > 0 && (
                  <div>
                    <Label>Size/Variant</Label>
                    <Select onValueChange={(value) => {
                      const variant = product.variants.find(v => v.id === value);
                      setSelectedVariant(variant || null);
                    }}>
                      <SelectTrigger data-testid="select-variant">
                        <SelectValue placeholder="Select size/variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id} data-testid={`option-variant-${variant.id}`}>
                            {variant.name} 
                            {variant.priceAdjustment !== 0 && (
                              <span className="ml-1 text-green-600">
                                ({variant.priceAdjustment > 0 ? '+' : ''}${variant.priceAdjustment.toFixed(2)})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Customization Options */}
                {product.customizationOptions?.allowNamePersonalization && (
                  <div>
                    <Label>Player Name (${product.customizationOptions.personalizationFee.toFixed(2)} extra)</Label>
                    <Input
                      placeholder="Enter player name"
                      value={customization.playerName || ''}
                      onChange={(e) => {
                        const sanitizedValue = e.target.value.replace(/[<>\"'&]/g, '').substring(0, 50);
                        setCustomization(prev => ({ ...prev, playerName: sanitizedValue }));
                      }}
                      maxLength={50}
                      data-testid="input-player-name"
                    />
                  </div>
                )}

                {product.customizationOptions?.allowNumberPersonalization && (
                  <div>
                    <Label>Player Number</Label>
                    <Input
                      placeholder="Enter player number"
                      value={customization.playerNumber || ''}
                      onChange={(e) => {
                        const sanitizedValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
                        setCustomization(prev => ({ ...prev, playerNumber: sanitizedValue }));
                      }}
                      maxLength={3}
                      data-testid="input-player-number"
                    />
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <Label>Quantity</Label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                    <SelectTrigger data-testid="select-quantity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(product.maxQuantityPerOrder, 10) }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()} data-testid={`option-quantity-${num}`}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Price:</span>
                    <span className="text-green-600 text-lg" data-testid="text-total-price">
                      ${(getPrice(product, selectedVariant || undefined) * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleAddToCart} 
                  className="w-full"
                  disabled={product.variants.length > 0 && !selectedVariant}
                  data-testid="button-add-to-cart"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <AuthenticatedLayout title="Tournament Store">
        <div className="text-center py-12">
          <p>Please log in to access the tournament store.</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout 
      title="Tournament Store" 
      subtitle="Official tournament merchandise and tickets"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Failed to load products. Showing sample merchandise below.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {displayProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600 mb-6">
                  Tournament directors can add merchandise products for this organization.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {displayProducts === sampleProducts && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Demo Store</h4>
            <p className="text-blue-700 text-sm">
              You're viewing sample tournament merchandise. Tournament directors can add real products 
              through the admin panel to replace these demo items.
            </p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}