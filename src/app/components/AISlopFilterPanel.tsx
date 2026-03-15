"use client";

import { useState } from "react";

interface AIFilterSettings {
  enabled: boolean;
  sensitivity: number;
  whitelist: string[];
}

interface WhitelistItem {
  type: "author" | "hashtag";
  value: string;
}

/**
 * AISlopFilterPanel Component
 * Provides UI for controlling AI slop filtering
 */
export default function AISlopFilterPanel({
  onFilterChange,
  initialSettings = {
    enabled: false,
    sensitivity: 50,
    whitelist: [],
  },
}: {
  onFilterChange: (settings: AIFilterSettings) => void;
  initialSettings?: AIFilterSettings;
}) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [sensitivity, setSensitivity] = useState(initialSettings.sensitivity);
  const [whitelistInput, setWhitelistInput] = useState("");
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>(
    initialSettings.whitelist.map((item) => {
      const [type, value] = item.split(":");
      return { type: (type as "author" | "hashtag") || "author", value };
    })
  );

  // Notify parent of changes
  const notifyChange = (newEnabled: boolean, newSensitivity: number, newWhitelist: WhitelistItem[]) => {
    const settingsString = newWhitelist
      .map((w) => `${w.type}:${w.value}`)
      .join(",");

    onFilterChange({
      enabled: newEnabled,
      sensitivity: newSensitivity,
      whitelist: settingsString ? settingsString.split(",") : [],
    });
  };

  // Toggle filter on/off
  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    notifyChange(newEnabled, sensitivity, whitelist);
  };

  // Change sensitivity slider
  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSensitivity = parseInt(e.target.value);
    setSensitivity(newSensitivity);
    notifyChange(enabled, newSensitivity, whitelist);
  };

  // Add to whitelist
  const handleAddWhitelist = () => {
    if (!whitelistInput.trim()) return;

    const input = whitelistInput.trim();
    let type: "author" | "hashtag" = "author";
    let value = input;

    if (input.startsWith("@")) {
      type = "author";
      value = input.slice(1); // Remove @
    } else if (input.startsWith("#")) {
      type = "hashtag";
      value = input.slice(1); // Remove #
    }

    const newWhitelist = [...whitelist, { type, value }];
    setWhitelist(newWhitelist);
    setWhitelistInput("");
    notifyChange(enabled, sensitivity, newWhitelist);
  };

  // Remove from whitelist
  const handleRemoveWhitelist = (index: number) => {
    const newWhitelist = whitelist.filter((_, i) => i !== index);
    setWhitelist(newWhitelist);
    notifyChange(enabled, sensitivity, newWhitelist);
  };

  // Handle Enter key in whitelist input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWhitelist();
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-transparent p-6 rounded-lg border border-blue-200 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🐋 AI Slop Filter
          </h3>
          <p className="text-sm text-gray-600">
            Filter out AI-generated content based on community feedback
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Filter Controls - Only show when enabled */}
      {enabled && (
        <div className="space-y-6">
          {/* Sensitivity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Baleen Sensitivity
              <span className="ml-2 text-gray-500 font-normal">
                {sensitivity === 0
                  ? "Strict (filter more)"
                  : sensitivity === 50
                  ? "Medium"
                  : sensitivity === 100
                  ? "Lenient (filter less)"
                  : `${sensitivity}%`}
              </span>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={sensitivity}
              onChange={handleSensitivityChange}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict</span>
              <span>Medium</span>
              <span>Lenient</span>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Lower = filter more posts for AI suspicious comments. Higher = only
              filter obvious AI content.
            </p>
          </div>

          {/* Whitelist - "Feed Between the Baleen" */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🐋 Feed Between the Baleen (Whitelist)
            </label>

            <p className="text-xs text-gray-600 mb-3">
              Posts from these creators/hashtags will always show, even if AI
              suspicious
            </p>

            {/* Whitelist Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={whitelistInput}
                onChange={(e) => setWhitelistInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="@author or #hashtag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddWhitelist}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>

            {/* Whitelist Tags */}
            <div className="flex flex-wrap gap-2">
              {whitelist.length === 0 ? (
                <p className="text-sm text-gray-500">No whitelisted content</p>
              ) : (
                whitelist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>
                      {item.type === "author" ? "@" : "#"}
                      {item.value}
                    </span>
                    <button
                      onClick={() => handleRemoveWhitelist(index)}
                      className="text-blue-700 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-gray-700 space-y-1">
            <p>
              <strong>How it works:</strong> Reads the first 10 comments on each
              post looking for AI-skeptical language like "AI generated", "bot",
              "GPT", etc.
            </p>
            <p>
              <strong>Score:</strong> Higher score = more AI suspicious. Your
              sensitivity slider determines the threshold.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Optional: AI Score Badge Component
 * Display on individual feed items
 */
export function AISlopScoreBadge({
  score,
  confidence,
}: {
  score?: number;
  confidence?: "low" | "medium" | "high";
}) {
  if (score === undefined || score === 0) return null;

  let bgColor = "bg-green-100 text-green-700"; // low
  let icon = "✓";

  if (score > 60) {
    bgColor = "bg-red-100 text-red-700";
    icon = "⚠️";
  } else if (score > 30) {
    bgColor = "bg-yellow-100 text-yellow-700";
    icon = "?";
  }

  return (
    <div className={`${bgColor} text-xs px-2 py-1 rounded-full`}>
      {icon} AI Score: {score}
    </div>
  );
}
