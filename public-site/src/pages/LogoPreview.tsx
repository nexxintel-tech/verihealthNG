export default function LogoPreview() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold text-center mb-4 text-gray-900">
          VeriHealth Logo Preview
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Choose your preferred unified logo design
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Option 1: Horizontal Lockup */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="aspect-[4/3] flex items-center justify-center bg-gray-50 rounded-lg mb-4">
              <img 
                src="/logo-horizontal.png" 
                alt="VeriHealth Horizontal Logo"
                className="max-w-full max-h-full object-contain p-8"
              />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-center">Option 1: Horizontal</h3>
            <p className="text-sm text-gray-600 text-center">
              Icon + text side by side. Best for headers and wide spaces.
            </p>
          </div>

          {/* Option 2: Stacked Vertical */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-lg mb-4">
              <img 
                src="/logo-stacked.png" 
                alt="VeriHealth Stacked Logo"
                className="max-w-full max-h-full object-contain p-8"
              />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-center">Option 2: Stacked</h3>
            <p className="text-sm text-gray-600 text-center">
              Icon above text. Balanced and compact design.
            </p>
          </div>

          {/* Option 3: Integrated */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="aspect-[4/3] flex items-center justify-center bg-gray-50 rounded-lg mb-4">
              <img 
                src="/logo-integrated.png" 
                alt="VeriHealth Integrated Logo"
                className="max-w-full max-h-full object-contain p-8"
              />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-center">Option 3: Integrated</h3>
            <p className="text-sm text-gray-600 text-center">
              Text and icon merged into unified design.
            </p>
          </div>
        </div>

        {/* Dark Background Preview */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900">
            Dark Background Preview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-medical-blue-600 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <img 
                src="/logo-horizontal.png" 
                alt="Horizontal on dark"
                className="max-w-full h-20 object-contain"
              />
            </div>
            <div className="bg-medical-blue-600 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <img 
                src="/logo-stacked.png" 
                alt="Stacked on dark"
                className="max-w-full h-24 object-contain"
              />
            </div>
            <div className="bg-medical-blue-600 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <img 
                src="/logo-integrated.png" 
                alt="Integrated on dark"
                className="max-w-full h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a 
            href="/" 
            className="inline-block px-8 py-3 bg-medical-blue-600 text-white rounded-lg font-semibold hover:bg-medical-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
