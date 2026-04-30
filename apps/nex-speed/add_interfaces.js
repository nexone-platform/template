import fs from 'fs';
let c = fs.readFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/services/api.ts', 'utf8');

const interfaces = `
export interface MechanicType { id: number; name: string; prefix?: string; description?: string; status: string; }
export interface MechanicExpertise { id: number; name: string; description?: string; status: string; }
export interface UnitType { id: number; name: string; description?: string; status: string; }
export interface LiquidType { id: number; name: string; description?: string; status: string; }
export interface PartCategory { id: number; name: string; description?: string; status: string; }
export interface PartGroup { id: number; name: string; description?: string; status: string; }
export interface StorageType { id: number; name: string; description?: string; status: string; }
export interface ParkingType { id: number; name: string; description?: string; status: string; }
`;

if (!c.includes('export interface MechanicType')) {
   c += '\n' + interfaces + '\n';
   fs.writeFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/services/api.ts', c);
}
console.log('Added interfaces');
