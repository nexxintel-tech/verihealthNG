import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: '/attached_assets/stock_images/nigerian_healthcare__6c280ac4.jpg',
    title: 'Advanced Remote Patient Monitoring',
    subtitle: 'Empower your healthcare team with AI-powered insights for proactive, personalized care',
  },
  {
    image: '/attached_assets/stock_images/nigerian_healthcare__fe8f3f29.jpg',
    title: 'Supporting Nigerian Healthcare Providers',
    subtitle: 'Delivering world-class monitoring technology to improve patient outcomes across Nigeria',
  },
  {
    image: '/attached_assets/stock_images/nigerian_healthcare__11fd18f9.jpg',
    title: 'Professional Clinical Excellence',
    subtitle: 'Trusted by healthcare professionals for real-time patient monitoring and care',
  },
  {
    image: '/attached_assets/stock_images/nigerian_family_heal_8832232c.jpg',
    title: 'Care for Every Generation',
    subtitle: 'From children to elderly, comprehensive health monitoring for Nigerian families',
  },
  {
    image: '/attached_assets/stock_images/nigerian_family_heal_a115db82.jpg',
    title: 'Family Health, Family Peace',
    subtitle: 'Keep your loved ones safe with 24/7 remote monitoring and instant alerts',
  },
  {
    image: '/attached_assets/stock_images/nigerian_young_adult_d252fcea.jpg',
    title: 'Wellness for Active Lifestyles',
    subtitle: 'Track fitness and vital signs to stay healthy and perform at your best',
  },
  {
    image: '/attached_assets/stock_images/nigerian_young_adult_159b18b6.jpg',
    title: 'Modern Healthcare for Modern Nigeria',
    subtitle: 'Join thousands using VeriHealth to take control of their health journey',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative overflow-hidden h-[600px] lg:h-[700px]" data-testid="hero-slider">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          data-testid={`hero-slide-${index}`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient - Darker for better button contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-medical-blue-900/75 to-medical-blue-700/60"></div>
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-balance animate-fade-in drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 text-balance animate-fade-in-delay drop-shadow-md">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
                <Link href="/contact">
                  <button
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                    data-testid="button-request-demo"
                  >
                    Request Demo
                  </button>
                </Link>
                <Link href="/about">
                  <button
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                    data-testid="button-about"
                  >
                    About
                  </button>
                </Link>
                <Link href="/shop">
                  <button
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                    data-testid="button-view-products"
                  >
                    View Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all z-10"
        aria-label="Previous slide"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all z-10"
        aria-label="Next slide"
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-3 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            data-testid={`button-dot-${index}`}
          />
        ))}
      </div>
    </section>
  );
}
