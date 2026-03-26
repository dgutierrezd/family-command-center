"use client";

import { useState, useTransition } from "react";
import { updateFamilyLocation } from "@/actions/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Locate } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

export function LocationPicker({ initialLat, initialLng }: LocationPickerProps) {
  const [lat, setLat] = useState(initialLat?.toString() ?? "");
  const [lng, setLng] = useState(initialLng?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);

  function handleGeolocate() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(4));
        setLng(position.coords.longitude.toFixed(4));
        setIsLocating(false);
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
        setIsLocating(false);
      }
    );
  }

  function handleSave() {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    startTransition(async () => {
      const result = await updateFamilyLocation(latitude, longitude);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Location updated");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium">Weather Location</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGeolocate}
        disabled={isLocating}
      >
        <Locate className="size-4 mr-1.5" />
        {isLocating ? "Locating..." : "Use my location"}
      </Button>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Latitude</label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 40.7128"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Longitude</label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. -74.0060"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !lat || !lng}
        size="sm"
      >
        {isPending ? "Saving..." : "Save Location"}
      </Button>
    </div>
  );
}
