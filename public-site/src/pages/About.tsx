import { Heart, Users, Award, Target } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centered',
      description: 'Every decision we make is guided by what\'s best for patient health and wellbeing',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We partner with healthcare providers to create solutions that truly work',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest standards in technology, security, and patient care',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Continuous improvement through cutting-edge research and development',
    },
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Medical Officer',
      bio: '15+ years in cardiology and telemedicine',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Chief Technology Officer',
      bio: 'Former Lead Engineer at major health tech companies',
    },
    {
      name: 'Emily Johnson',
      role: 'VP of Clinical Operations',
      bio: 'Registered nurse with expertise in remote monitoring',
    },
    {
      name: 'David Park',
      role: 'Head of AI Research',
      bio: 'PhD in Machine Learning, published researcher',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
            About VeriHealth
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100">
            Pioneering the future of remote patient monitoring with technology that saves lives
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                VeriHealth was founded with a simple yet powerful vision: to make high-quality 
                healthcare accessible to everyone, regardless of location or circumstance.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We believe that continuous remote monitoring combined with artificial intelligence 
                can revolutionize how chronic conditions are managed, preventing complications 
                before they become critical.
              </p>
              <p className="text-lg text-gray-600">
                Our platform empowers healthcare providers with real-time data and actionable 
                insights, enabling them to deliver proactive, personalized care that improves 
                patient outcomes and reduces healthcare costs.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80" 
                alt="Healthcare professionals collaborating" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                <div className="h-16 w-16 rounded-full bg-medical-blue-100 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-medical-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry experts dedicated to transforming healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="h-48 w-48 rounded-full bg-gradient-to-br from-medical-blue-400 to-medical-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-medical-blue-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-32 bg-medical-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              Impact by the Numbers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="text-5xl lg:text-6xl font-heading font-bold mb-2">10,000+</div>
              <p className="text-xl text-blue-100">Patients monitored daily</p>
            </div>
            <div className="text-center">
              <div className="text-5xl lg:text-6xl font-heading font-bold mb-2">500+</div>
              <p className="text-xl text-blue-100">Healthcare providers</p>
            </div>
            <div className="text-center">
              <div className="text-5xl lg:text-6xl font-heading font-bold mb-2">40%</div>
              <p className="text-xl text-blue-100">Reduction in hospital readmissions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
