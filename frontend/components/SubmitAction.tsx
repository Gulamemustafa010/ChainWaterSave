"use client";

import { useState } from "react";
import { ActionType } from "@/hooks/useWaterSaveLog";
import { RippleEffect } from "./WaterDropAnimation";

const ACTION_TYPES: { value: ActionType; label: string; icon: string; description: string }[] = [
  { value: "ShorterShower", label: "Shorter Shower", icon: "🚿", description: "Reduce shower time" },
  { value: "CloseFaucet", label: "Close Faucet", icon: "🚰", description: "Turn off faucet" },
  { value: "RainwaterGarden", label: "Rainwater Garden", icon: "🌧️", description: "Collect rainwater" },
  { value: "ReuseWater", label: "Reuse Water", icon: "♻️", description: "Recycle water" },
  { value: "Other", label: "Other", icon: "💡", description: "Other water saving actions" },
];

const CITY_CODES: { value: number; label: string }[] = [
  { value: 1, label: "Beijing" },
  { value: 2, label: "Shanghai" },
  { value: 3, label: "Guangzhou" },
  { value: 4, label: "Shenzhen" },
  { value: 5, label: "Other" },
];

export const SubmitAction = ({
  onSubmit,
  canSubmit,
  isSubmitting,
}: {
  onSubmit: (liters: number, actionType: ActionType, cityCode: number) => Promise<boolean>;
  canSubmit: boolean;
  isSubmitting: boolean;
}) => {
  const [liters, setLiters] = useState<number>(10);
  const [actionType, setActionType] = useState<ActionType>("ShorterShower");
  const [cityCode, setCityCode] = useState<number>(5);
  const [showRipple, setShowRipple] = useState(false);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setShowRipple(true);
    const success = await onSubmit(liters, actionType, cityCode);
    
    setTimeout(() => setShowRipple(false), 2000);

    if (success) {
      // Reset form
      setLiters(10);
      setActionType("ShorterShower");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="text-4xl mr-3">💧</span>
          Submit Today's Water Saving
        </h2>

        {/* Liters Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-lg font-semibold text-gray-700">Water Saved</label>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold text-primary">{liters}</span>
              <span className="text-xl text-gray-600">L</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={liters}
            onChange={(e) => setLiters(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-blue-200 to-primary rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #00AEEF 0%, #00AEEF ${liters}%, #E5E7EB ${liters}%, #E5E7EB 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1L</span>
            <span>50L</span>
            <span>100L</span>
          </div>
        </div>

        {/* Action Type Selection */}
        <div className="mb-8">
          <label className="text-lg font-semibold text-gray-700 mb-3 block">Action Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ACTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setActionType(type.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  actionType === type.value
                    ? "border-primary bg-primary/10 shadow-lg transform scale-105"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-semibold text-gray-700">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* City Selection */}
        <div className="mb-8">
          <label className="text-lg font-semibold text-gray-700 mb-3 block">City</label>
          <select
            value={cityCode}
            onChange={(e) => setCityCode(Number(e.target.value))}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-700"
          >
            {CITY_CODES.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="relative">
          <RippleEffect show={showRipple} />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-2">🌊</span>
                Submit Water Saving Record
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

