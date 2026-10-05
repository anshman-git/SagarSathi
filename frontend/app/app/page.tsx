'use client';

import React from 'react';
import MapView from '../../components/MapView';
import FloatingOmnibar from '../../components/FloatingOmnibar';

export default function MarineMapPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ocean-950">
      {/* Full-Screen Geospatial Canvas */}
      <MapView />

      {/* Floating Google Maps Omnibar & Conversational Card */}
      <FloatingOmnibar />
    </div>
  );
}
