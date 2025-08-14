import { CustomCard, CustomButton } from '@/components/ui/custom-card';
import { AnimatedText, FloatingElement } from '@/components/ui/animated-text';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Sparkles, Heart } from 'lucide-react';

export default function CustomDesignDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <AnimatedText variant="gradient" className="text-4xl md:text-6xl font-bold">
            Custom Design System
          </AnimatedText>
          <AnimatedText variant="glow" delay={0.5}>
            <p className="text-xl text-slate-300">
              Showcasing custom CSS and Tailwind components
            </p>
          </AnimatedText>
        </div>

        {/* Button Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomCard variant="glass" className="text-center space-y-4">
            <AnimatedText variant="gradient">
              <h3 className="text-2xl font-bold">Gradient Buttons</h3>
            </AnimatedText>
            <div className="space-y-3">
              <CustomButton variant="gradient" size="sm" data-testid="btn-gradient-small">
                <Zap className="w-4 h-4 mr-2" />
                Small Gradient
              </CustomButton>
              <CustomButton variant="gradient" size="md" data-testid="btn-gradient-medium">
                <Star className="w-4 h-4 mr-2" />
                Medium Gradient
              </CustomButton>
              <CustomButton variant="gradient" size="lg" data-testid="btn-gradient-large">
                <Sparkles className="w-4 h-4 mr-2" />
                Large Gradient
              </CustomButton>
            </div>
          </CustomCard>

          <CustomCard variant="gradient" className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Glow Effects</h3>
            <div className="space-y-3">
              <CustomButton variant="glow" size="md" data-testid="btn-glow-1">
                <Heart className="w-4 h-4 mr-2" />
                Glowing Button
              </CustomButton>
              <CustomButton variant="glass" size="md" data-testid="btn-glass-1">
                Glass Effect
              </CustomButton>
              <div className="p-4 rounded-lg shadow-glow-lg bg-custom-primary/20">
                <p className="text-white">Box with glow shadow</p>
              </div>
            </div>
          </CustomCard>

          <CustomCard variant="default" className="text-center space-y-4">
            <AnimatedText variant="glow">
              <h3 className="text-2xl font-bold">Custom Utilities</h3>
            </AnimatedText>
            <div className="space-y-3">
              <Badge className="bg-custom-primary text-white">Custom Color</Badge>
              <Badge className="bg-glass-100 backdrop-blur-sm">Glass Badge</Badge>
              <div className="w-16 h-16 bg-custom-secondary rounded-full mx-auto animate-pulse-glow"></div>
            </div>
          </CustomCard>
        </div>

        {/* Animation Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomCard variant="glass" className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Floating Elements</h3>
            <div className="flex justify-around items-center py-8">
              <FloatingElement delay={0}>
                <div className="w-12 h-12 bg-custom-primary rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </FloatingElement>
              <FloatingElement delay={1}>
                <div className="w-12 h-12 bg-custom-secondary rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </FloatingElement>
              <FloatingElement delay={2}>
                <div className="w-12 h-12 bg-custom-gradient-start rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </FloatingElement>
            </div>
          </CustomCard>

          <CustomCard variant="default" className="space-y-4">
            <h3 className="text-2xl font-bold">Text Animations</h3>
            <div className="space-y-3">
              <AnimatedText variant="gradient" delay={0}>
                <p className="text-lg">Gradient Text with Pulse</p>
              </AnimatedText>
              <AnimatedText variant="glow" delay={0.5}>
                <p className="text-lg">Glowing Text Effect</p>
              </AnimatedText>
              <AnimatedText variant="typewriter" delay={1}>
                <p className="text-lg">Slide-in Animation</p>
              </AnimatedText>
            </div>
          </CustomCard>
        </div>

        {/* Custom Spacing & Layout */}
        <CustomCard variant="glass" className="space-y-6">
          <h3 className="text-3xl font-bold text-center text-white">Custom Spacing & Layout</h3>
          <div className="grid grid-cols-3 gap-18 text-center">
            <div className="p-6 bg-custom-primary/20 rounded-xl">
              <p className="text-white">Gap 18 (4.5rem)</p>
            </div>
            <div className="p-6 bg-custom-secondary/20 rounded-xl">
              <p className="text-white">Custom spacing</p>
            </div>
            <div className="p-6 bg-custom-gradient-start/20 rounded-xl">
              <p className="text-white">Flexible layout</p>
            </div>
          </div>
          <div className="h-88 bg-gradient-to-r from-custom-gradient-start/20 to-custom-gradient-end/20 rounded-2xl flex items-center justify-center">
            <p className="text-white text-xl">Height: 22rem (h-88)</p>
          </div>
        </CustomCard>

        {/* Loading States */}
        <CustomCard variant="default" className="space-y-4">
          <h3 className="text-2xl font-bold text-center">Loading States</h3>
          <div className="flex justify-center space-x-4">
            <CustomButton variant="gradient" loading data-testid="btn-loading">
              Loading...
            </CustomButton>
            <CustomButton variant="glow" disabled data-testid="btn-disabled">
              Disabled
            </CustomButton>
          </div>
        </CustomCard>

      </div>
    </div>
  );
}