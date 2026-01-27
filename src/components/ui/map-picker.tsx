'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix Leaflet marker icon issue in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Default center: Abasan Alkabera
const DEFAULT_CENTER: [number, number] = [31.3235, 34.3644];

function LocationMarker({ position, setPosition, mapRef }: { position: [number, number], setPosition: (pos: [number, number]) => void, mapRef?: any }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Store map reference
    useEffect(() => {
        if (mapRef) {
            mapRef.current = map;
        }
    }, [map, mapRef]);

    return position === null ? null : (
        <Marker position={position} icon={icon} draggable={true} eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setPosition([position.lat, position.lng]);
            },
        }} />
    );
}

interface MapPickerProps {
    value?: { lat: number; lng: number };
    onChange: (value: { lat: number; lng: number }) => void;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number]>(
        value ? [value.lat, value.lng] : DEFAULT_CENTER
    );
    const [isLocating, setIsLocating] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const mapRef = useRef<any>(null);

    const handleSetPosition = (pos: [number, number]) => {
        setPosition(pos);
        onChange({ lat: pos[0], lng: pos[1] });
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser / المتصفح لا يدعم تحديد الموقع');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (geoPosition) => {
                const newPos: [number, number] = [geoPosition.coords.latitude, geoPosition.coords.longitude];
                const locationAccuracy = geoPosition.coords.accuracy;

                handleSetPosition(newPos);
                setAccuracy(locationAccuracy);

                // Fly to the new position with smooth animation
                if (mapRef.current) {
                    mapRef.current.flyTo(newPos, 17, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }

                // Show accuracy info
                const accuracyMsg = locationAccuracy < 50
                    ? `موقع دقيق جداً (${Math.round(locationAccuracy)}م)\nVery accurate (${Math.round(locationAccuracy)}m)`
                    : locationAccuracy < 100
                        ? `دقة جيدة (${Math.round(locationAccuracy)}م)\nGood accuracy (${Math.round(locationAccuracy)}m)`
                        : `دقة متوسطة (${Math.round(locationAccuracy)}م)\nModerate accuracy (${Math.round(locationAccuracy)}m)\n\nنصيحة: فعّل GPS للحصول على دقة أفضل\nTip: Enable GPS for better accuracy`;

                console.log('Location accuracy:', locationAccuracy + 'm');

                setIsLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setIsLocating(false);

                let errorMessage = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permission denied. Please allow location access.\nتم رفض الإذن. يرجى السماح بالوصول إلى الموقع.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.\nمعلومات الموقع غير متوفرة.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.\nانتهت مهلة طلب الموقع.';
                        break;
                    default:
                        errorMessage = 'Unable to get your location.\nلا يمكن الحصول على موقعك.';
                }
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Ensure Leaflet only runs on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>;

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
            <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} mapRef={mapRef} />
                {accuracy && (
                    <Circle
                        center={position}
                        radius={accuracy}
                        pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.1,
                            weight: 2
                        }}
                    />
                )}
            </MapContainer>
            <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="absolute top-2 right-2 z-[1000] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-md"
                size="sm"
            >
                <MapPin className="w-4 h-4 mr-1" />
                {isLocating ? 'جاري التحديد...' : 'موقعي الحالي'}
            </Button>
            <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 px-2 py-1 rounded text-xs text-slate-600 border border-slate-200">
                {accuracy ? (
                    <span className={accuracy < 50 ? 'text-green-600 font-semibold' : accuracy < 100 ? 'text-blue-600' : 'text-orange-600'}>
                        دقة: {Math.round(accuracy)}م | Accuracy: {Math.round(accuracy)}m
                    </span>
                ) : (
                    'انقر على الخريطة أو اسحب العلامة لتحديد الموقع'
                )}
            </div>
        </div>
    );
}
