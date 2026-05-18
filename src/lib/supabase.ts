import { createClient } from '@supabase/supabase-js';
import { getTreeImage } from '../app/data/treeImages';
import type { Tree } from '../app/data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function mapDbTreeToFrontend(r: any): Tree {
  return {
    id: r.id,
    nfcId: r.nfc_id,
    species: r.species,
    age: r.age,
    latitude: r.latitude,
    longitude: r.longitude,
    health: r.health,
    temperature: r.temperature,
    lastUpdate: r.updated_at || r.created_at,
    status: r.status,
    sensorConnected: r.sensor_connected,
    registrationDate: r.registration_date,
    manejo: r.manejo,
    diameter: r.diameter,
    height: r.height,
    imageUrl: r.image_url || getTreeImage(r.nfc_id) || '',
    location: r.location,
    baseDiameter: r.base_diameter,
    baseHeight: r.base_height,
    lastValidation: r.last_validation,
  };
}

export function mapTreeToDb(tree: Partial<Tree>): any {
  return {
    nfc_id: tree.nfcId,
    species: tree.species,
    age: tree.age,
    latitude: tree.latitude,
    longitude: tree.longitude,
    health: tree.health,
    temperature: tree.temperature,
    status: tree.status,
    sensor_connected: tree.sensorConnected,
    registration_date: tree.registrationDate,
    manejo: tree.manejo,
    diameter: tree.diameter,
    height: tree.height,
    image_url: tree.imageUrl,
    location: tree.location,
    base_diameter: tree.baseDiameter,
    base_height: tree.baseHeight,
    updated_at: new Date().toISOString(),
  };
}
