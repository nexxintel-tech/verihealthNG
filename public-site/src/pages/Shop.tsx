import { ShoppingCart, ArrowRight } from 'lucide-react';

export default function Shop() {
  const products = [
    {
      id: 1,
      name: 'VeriHealth Starter Kit',
      price: '$299',
      description: 'Complete monitoring package for individual patients',
      features: [
        'Blood pressure monitor',
        'Pulse oximeter',
        'Weight scale',
        '3 months of monitoring service',
      ],
      image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'VeriHealth Professional',
      price: '$799',
      description: 'Advanced monitoring suite for healthcare facilities',
      features: [
        'All Starter Kit devices',
        'ECG monitor',
        'Glucose meter',
        '12 months monitoring service',
        'Priority support',
      ],
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'VeriHealth Enterprise',
      price: 'Custom',
      description: 'Complete remote monitoring solution for large organizations',
      features: [
        'Unlimited devices',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        '24/7 premium support',
      ],
      image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      name: 'Replacement Sensors',
      price: '$49',
      description: 'High-quality replacement sensors and accessories',
      features: [
        'Compatible with all VeriHealth devices',
        '1-year warranty',
        'FDA approved',
        'Fast shipping',
      ],
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      name: 'Annual Monitoring License',
      price: '$599/year',
      description: 'Software license for continuous patient monitoring',
      features: [
        'Unlimited patient profiles',
        'AI-powered risk analysis',
        'Real-time alerts',
        'Mobile app access',
        'Data export tools',
      ],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      name: 'Training & Certification',
      price: '$399',
      description: 'Comprehensive training program for healthcare staff',
      features: [
        '8-hour online course',
        'Hands-on device training',
        'Certification upon completion',
        'Lifetime access to materials',
      ],
      image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&q=80',
    },
  ];

  // Placeholder function - will be proxied to CS Cart
  const handleAddToCart = (productId: number) => {
    alert(`Product ${productId} will be added to cart via CS Cart integration`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
            VeriHealth Products
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Professional-grade remote monitoring devices and software solutions
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-heading font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="text-2xl font-bold text-medical-blue-600">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {product.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-medical-blue-600 mt-1.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full px-6 py-3 bg-medical-blue-600 text-white rounded-lg font-semibold hover:bg-medical-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Our team of experts is here to help you find the perfect solution for your needs
          </p>
          <a href="/contact">
            <button className="px-8 py-4 bg-medical-blue-600 text-white rounded-lg font-semibold hover:bg-medical-blue-700 transition-colors inline-flex items-center gap-2">
              Contact Sales
              <ArrowRight className="h-5 w-5" />
            </button>
          </a>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-heading font-bold text-gray-900 mb-1">FDA</div>
              <div className="text-sm text-gray-600">Approved Devices</div>
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-gray-900 mb-1">HIPAA</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-gray-900 mb-1">30-Day</div>
              <div className="text-sm text-gray-600">Money Back</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
