import { Link } from 'wouter';
import { Activity, Shield, Zap, Clock, ArrowRight } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';

export default function Home() {
  const features = [
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Track vital signs continuously with AI-powered alerts for early intervention',
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security ensuring patient data protection and privacy',
    },
    {
      icon: Zap,
      title: 'AI Risk Scoring',
      description: 'Machine learning algorithms predict patient deterioration before it happens',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock technical support and clinical guidance for your team',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Patients Monitored' },
    { value: '500+', label: 'Healthcare Providers' },
    { value: '99.9%', label: 'System Uptime' },
    { value: '40%', label: 'Reduced Readmissions' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-heading font-bold text-medical-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Why Choose VeriHealth?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology designed to transform how you monitor and care for patients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-medical-blue-300 hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-lg bg-medical-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-medical-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple setup, powerful results in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-medical-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  Setup Devices
                </h3>
                <p className="text-gray-600">
                  Patients receive easy-to-use monitoring devices that sync with their smartphones
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-medical-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  Continuous Monitoring
                </h3>
                <p className="text-gray-600">
                  Vital signs are automatically collected and analyzed in real-time by our AI
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-medical-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  Actionable Insights
                </h3>
                <p className="text-gray-600">
                  Clinicians receive alerts and recommendations through the secure portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-medical-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Transform Patient Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of healthcare providers using VeriHealth to improve patient outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-white text-medical-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
                Schedule a Demo
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/portal">
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Clinician Login
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
