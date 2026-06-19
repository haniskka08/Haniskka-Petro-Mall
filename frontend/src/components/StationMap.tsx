import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Typography } from '@mui/material'
import { MyLocationOutlined, LocalGasStation } from '@mui/icons-material'

// Fix Leaflet's broken icon paths in Vite/webpack builds
;(L.Icon.Default.prototype as any)._getIconUrl = undefined
L.Icon.Default.mergeOptions({
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export interface MapStation {
  id: number
  name: string
  address: string
  city: string
  state: string
  latitude?: number | null
  longitude?: number | null
  contact_number?: string | null
  status?: string
}

interface StationMapProps {
  stations: MapStation[]
  onMarkerClick?: (station: MapStation) => void
  height?: number | string
}

const STATUS_COLORS: Record<string, string> = {
  green:    '#2E7D32',
  pending:  '#FB8C00',
  rejected: '#d32f2f',
}

export default function StationMap({ stations, onMarkerClick, height = 480 }: StationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const layerRef     = useRef<L.LayerGroup | null>(null)

  const mappable = stations.filter(s => s.latitude != null && s.longitude != null)

  // ── Initialize map once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      preferCanvas: true,
    }).setView([20.5937, 78.9629], 5)

    mapRef.current = map

    // CartoDB Dark Matter — free, no API key needed
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Layer group for efficient marker management
    layerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, []) // Only runs once on mount

  // ── Update markers whenever stations change ────────────────────────────────
  useEffect(() => {
    const map   = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    const bounds: L.LatLngTuple[] = []

    mappable.forEach(station => {
      const lat   = station.latitude  as number
      const lng   = station.longitude as number
      const color = STATUS_COLORS[station.status ?? 'pending'] ?? '#FB8C00'

      const icon = L.divIcon({
        html: `
          <div style="
            width:36px;height:36px;background:${color};border:3px solid #fff;
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            box-shadow:0 3px 14px rgba(0,0,0,0.45);
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:14px;display:block;text-align:center;margin-top:2px">⛽</span>
          </div>`,
        className: '',
        iconSize:    [36, 36],
        iconAnchor:  [18, 36],
        popupAnchor: [0, -38],
      })

      const statusLabel = (station.status ?? 'pending').charAt(0).toUpperCase() + (station.status ?? 'pending').slice(1)

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(L.popup({ maxWidth: 300 }).setContent(`
          <div style="font-family:Inter,system-ui,sans-serif;padding:4px 2px;min-width:200px">
            <div style="font-weight:800;font-size:14px;color:#0D1B2A;margin-bottom:6px">⛽ ${station.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:3px">📍 ${station.address}</div>
            <div style="font-size:12px;color:#666;margin-bottom:3px">🏙️ ${station.city}, ${station.state}</div>
            ${station.contact_number ? `<div style="font-size:12px;color:#666;margin-bottom:8px">📞 ${station.contact_number}</div>` : ''}
            <div style="margin-top:8px">
              <span style="background:${color}22;color:${color};border:1px solid ${color}66;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700">${statusLabel}</span>
            </div>
            <div style="font-size:10px;color:#aaa;margin-top:6px;font-family:monospace">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
          </div>
        `))

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(station as any))
      }

      layer.addLayer(marker)
      bounds.push([lat, lng])
    })

    // Fit view to all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
    }
  }, [stations]) // Runs whenever stations prop changes

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
      {/* Stations counter — top left */}
      <Box sx={{
        position: 'absolute', top: 12, left: 12, zIndex: 500,
        background: 'rgba(13,27,42,0.88)', backdropFilter: 'blur(8px)',
        borderRadius: 2, px: 1.5, py: 0.8, border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', gap: 0.8, pointerEvents: 'none',
      }}>
        <LocalGasStation sx={{ fontSize: 14, color: '#FB8C00' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', fontSize: 11 }}>
          {mappable.length} / {stations.length} on map
        </Typography>
      </Box>

      {/* Legend — top right */}
      <Box sx={{
        position: 'absolute', top: 12, right: 12, zIndex: 500,
        background: 'rgba(13,27,42,0.88)', backdropFilter: 'blur(8px)',
        borderRadius: 2, p: 1.5, border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column', gap: 0.8, pointerEvents: 'none',
      }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 9 }}>
          Status
        </Typography>
        {Object.entries(STATUS_COLORS).map(([key, col]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: col, border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'capitalize', fontSize: 11 }}>
              {key}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* No-coords overlay */}
      {stations.length > 0 && mappable.length === 0 && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 400,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(13,27,42,0.7)', pointerEvents: 'none',
        }}>
          <MyLocationOutlined sx={{ fontSize: 44, color: 'rgba(255,255,255,0.3)', mb: 1 }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: 13 }}>
            No stations have GPS coordinates yet.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, mt: 0.5 }}>
            Use "Auto-locate" when editing a station.
          </Typography>
        </Box>
      )}

      {/* Map container */}
      <div
        ref={containerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      />
    </Box>
  )
}
