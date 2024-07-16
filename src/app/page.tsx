import LaptopCalculator from './LaptopCalculator';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Laptop CO2 Impact Calculator</h1>
        <LaptopCalculator />
      </div>
    </div>
  );
}