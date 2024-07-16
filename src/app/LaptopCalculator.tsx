'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Info, ArrowUpDown, BarChart as BarChartIcon, PlusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Laptop {
  id: string;
  model: string;
  co2: number;
  year: number;
  manufacturer: string;
  isRefurbished: boolean;
}

const laptopData: Laptop[] = [
  { id: "1", model: "ThinkPad E460", co2: 340.00, year: 2015, manufacturer: "Lenovo", isRefurbished: false },
  { id: "2", model: "ThinkPad L380 Yoga", co2: 298.00, year: 2018, manufacturer: "Lenovo", isRefurbished: false },
  { id: "3", model: "ThinkPad L440", co2: 278.00, year: 2013, manufacturer: "Lenovo", isRefurbished: false },
  { id: "4", model: "ThinkPad T450", co2: 457.00, year: 2015, manufacturer: "Lenovo", isRefurbished: false },
  { id: "5", model: "ThinkPad X1 Carbon 5th Gen", co2: 279.00, year: 2017, manufacturer: "Lenovo", isRefurbished: false },
  { id: "6", model: "MacBook Air (M1, 2020)", co2: 160.00, year: 2020, manufacturer: "Apple", isRefurbished: false },
  { id: "7", model: "Dell XPS 13 (9310)", co2: 296.00, year: 2020, manufacturer: "Dell", isRefurbished: false },
  { id: "8", model: "HP Spectre x360 14", co2: 309.00, year: 2021, manufacturer: "HP", isRefurbished: false },
  { id: "9", model: "ThinkPad T450", co2: 91.40, year: 2015, manufacturer: "Lenovo", isRefurbished: true },
  { id: "10", model: "MacBook Air 2019", co2: 56.00, year: 2019, manufacturer: "Apple", isRefurbished: true },
  { id: "11", model: "Dell Latitude 7400", co2: 88.80, year: 2019, manufacturer: "Dell", isRefurbished: true },
];

export default function LaptopCalculator() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchingLaptops, setMatchingLaptops] = useState<Laptop[]>([]);
  const [selectedLaptops, setSelectedLaptops] = useState<Laptop[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  useEffect(() => {
    const results = laptopData.filter(laptop =>
      laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laptop.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMatchingLaptops(results);
  }, [searchTerm]);

  const handleSelectLaptop = (laptop: Laptop) => {
    if (!selectedLaptops.some(selected => selected.id === laptop.id)) {
      setSelectedLaptops([...selectedLaptops, laptop]);
      setSearchTerm('');
      setAlertMessage(`${laptop.manufacturer} ${laptop.model} toegevoegd aan vergelijking.`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } else {
      setAlertMessage("Deze laptop is al geselecteerd.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleRemoveLaptop = (laptop: Laptop) => {
    setSelectedLaptops(selectedLaptops.filter(selected => selected.id !== laptop.id));
  };

  const handleAddVariant = (laptop: Laptop) => {
    const variant = laptopData.find(l => 
      l.model === laptop.model && 
      l.manufacturer === laptop.manufacturer && 
      l.isRefurbished !== laptop.isRefurbished
    );
    if (variant) {
      handleSelectLaptop(variant);
    } else {
      setAlertMessage(`Geen ${laptop.isRefurbished ? 'nieuwe' : 'refurbished'} variant gevonden voor deze laptop.`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const calculateSavings = () => {
    const newLaptops = selectedLaptops.filter(laptop => !laptop.isRefurbished);
    const refurbishedLaptops = selectedLaptops.filter(laptop => laptop.isRefurbished);
    
    let totalSavings = 0;
    let comparisonPairs = [];

    newLaptops.forEach(newLaptop => {
      const refurbishedMatch = refurbishedLaptops.find(
        refurb => refurb.model === newLaptop.model && refurb.manufacturer === newLaptop.manufacturer
      );
      if (refurbishedMatch) {
        const saving = newLaptop.co2 - refurbishedMatch.co2;
        totalSavings += saving;
        comparisonPairs.push({ new: newLaptop, refurbished: refurbishedMatch, saving });
      }
    });

    return { totalSavings, comparisonPairs };
  };

  const { totalSavings, comparisonPairs } = calculateSavings();
  const totalCO2 = selectedLaptops.reduce((sum, laptop) => sum + laptop.co2, 0);
  const flightsEquivalent = (totalCO2 / 90).toFixed(2); // 90 kg CO2 per retourvlucht Amsterdam-Parijs
  const savingsFlightsEquivalent = (totalSavings / 90).toFixed(2);

  const chartData = selectedLaptops.map(laptop => ({
    ...laptop,
    newCO2: laptop.isRefurbished ? 0 : laptop.co2,
    refurbishedCO2: laptop.isRefurbished ? laptop.co2 : 0
  }));

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Zoek en vergelijk laptops</h2>
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Zoek op merk of model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 border border-gray-300 rounded text-gray-700 bg-white"
            />
            <Search className="absolute left-2 top-2 text-gray-400" size={20} />
          </div>
          {matchingLaptops.length > 0 && searchTerm && (
            <ul className="border border-gray-200 rounded bg-white max-h-60 overflow-y-auto">
              {matchingLaptops.map((laptop) => (
                <li 
                  key={laptop.id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 flex justify-between items-center"
                >
                  <span onClick={() => handleSelectLaptop(laptop)}>
                    {laptop.manufacturer} {laptop.model} ({laptop.year})
                    {laptop.isRefurbished && <span className="ml-2 text-green-600 text-xs font-semibold">Refurbished</span>}
                  </span>
                  <div>
                    <span className="text-sm text-gray-500 mr-2">{laptop.co2} kg CO2 eq</span>
                    <button
                      onClick={() => handleAddVariant(laptop)}
                      className="text-blue-500 hover:text-blue-700"
                      title={`Voeg ${laptop.isRefurbished ? 'nieuwe' : 'refurbished'} variant toe`}
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {showAlert && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{alertMessage}</span>
          </div>
        )}

        {selectedLaptops.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Geselecteerde Laptops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedLaptops.map((laptop) => (
                <div key={laptop.id} className="bg-gray-50 p-4 rounded-lg relative shadow">
                  <button 
                    onClick={() => handleRemoveLaptop(laptop)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                  <p className="font-semibold text-gray-800">
                    {laptop.manufacturer} {laptop.model}
                    {laptop.isRefurbished && <span className="ml-2 text-green-600 text-xs font-semibold">Refurbished</span>}
                  </p>
                  <p className="text-sm text-gray-600">Jaar: {laptop.year}</p>
                  <p className="text-sm text-gray-600">CO2 Impact: {laptop.co2} kg CO2 eq</p>
                  <button
                    onClick={() => handleAddVariant(laptop)}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                  >
                    Voeg {laptop.isRefurbished ? 'nieuwe' : 'refurbished'} variant toe
                  </button>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Conclusie</h2>
            <div className="mb-4">
              <p className="text-lg font-bold text-blue-800">
                Totale CO2 Impact: {totalCO2.toFixed(2)} kg CO2 eq
              </p>
              <p className="text-sm text-blue-600 mt-2">
                <Info size={16} className="inline mr-1" />
                Dit is equivalent aan ongeveer {flightsEquivalent} retourvluchten tussen Amsterdam en Parijs.
              </p>
            </div>

            {comparisonPairs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Vergelijking Nieuw vs. Refurbished</h3>
                {comparisonPairs.map((pair, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold">{pair.new.manufacturer} {pair.new.model}:</p>
                    <p>Nieuw: {pair.new.co2.toFixed(2)} kg CO2 eq</p>
                    <p>Refurbished: {pair.refurbished.co2.toFixed(2)} kg CO2 eq</p>
                    <p className="text-green-600 font-semibold">
                      Besparing: {pair.saving.toFixed(2)} kg CO2 eq
                    </p>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-800">
                    Totale CO2 Besparing: {totalSavings.toFixed(2)} kg CO2 eq
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    <Info size={16} className="inline mr-1" />
                    Deze besparing is equivalent aan ongeveer {savingsFlightsEquivalent} retourvluchten tussen Amsterdam en Parijs.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedLaptops.length > 1 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <BarChartIcon className="mr-2" /> Vergelijking CO2 Impact
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-300 rounded shadow">
                          <p className="font-semibold">{data.manufacturer} {data.model}</p>
                          <p>Jaar: {data.year}</p>
                          <p>CO2: {data.co2} kg CO2 eq</p>
                          <p>{data.isRefurbished ? 'Refurbished' : 'Nieuw'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="newCO2" name="Nieuw" fill="#3B82F6" />
                <Bar dataKey="refurbishedCO2" name="Refurbished" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Over deze calculator</h2>
          <p className="text-sm text-gray-600">
            De CO2-impact gegevens zijn gebaseerd op schattingen van de levenscyclusanalyse van laptops, 
            inclusief productie, transport, en gemiddeld energieverbruik over een periode van 4 jaar. 
            Voor refurbished apparaten is de CO2-impact lager omdat een groot deel van de productie-impact 
            wordt vermeden. Werkelijke waarden kunnen variëren afhankelijk van gebruikspatronen en levensduur van het apparaat.
            De vergelijking met vliegreizen is gebaseerd op een gemiddelde CO2-uitstoot van 90 kg per passagier 
            voor een retourvlucht Amsterdam-Parijs.
          </p>
        </div>
      </div>
    </div>
  );
}