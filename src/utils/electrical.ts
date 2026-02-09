/**
 * Electrical calculation utilities for ElectriPro
 */

export const CONDUCTIVITY = {
    COPPER: 56,
    ALUMINUM: 35
};

export const SYSTEMS = {
    SINGLE_PHASE: 'Monofásico',
    THREE_PHASE: 'Trifásico'
};

export interface SectionCalculationParams {
    potencia: number;
    tension: number;
    factorPotencia: number;
    sistema: string;
    longitud: number;
    maxCaidaTension: number; // percentage, e.g., 3
    material: 'COPPER' | 'ALUMINUM';
}

/**
 * Calculate current (I) in Amperes
 */
export const calculateCurrent = (params: Pick<SectionCalculationParams, 'potencia' | 'tension' | 'factorPotencia' | 'sistema'>) => {
    const { potencia, tension, factorPotencia, sistema } = params;
    if (sistema === SYSTEMS.THREE_PHASE) {
        return potencia / (tension * factorPotencia * Math.sqrt(3));
    }
    return potencia / (tension * factorPotencia);
};

/**
 * Calculate required section (S) in mm² based on voltage drop
 */
export const calculateSectionByVoltageDrop = (params: SectionCalculationParams) => {
    const { tension, sistema, longitud, maxCaidaTension, material, factorPotencia } = params;
    const current = calculateCurrent(params);
    const conductivity = CONDUCTIVITY[material];
    const deltaV = (maxCaidaTension / 100) * tension;

    if (sistema === SYSTEMS.THREE_PHASE) {
        // S = (√3 * L * I * cosφ) / (k * ΔV)
        return (Math.sqrt(3) * longitud * current * factorPotencia) / (conductivity * deltaV);
    }
    // S = (2 * L * I * cosφ) / (k * ΔV)
    return (2 * longitud * current * factorPotencia) / (conductivity * deltaV);
};

/**
 * Find standard cable sections (simplified)
 */
export const STANDARD_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

export const getNextStandardSection = (calculatedSec: number) => {
    return STANDARD_SECTIONS.find(s => s >= calculatedSec) || STANDARD_SECTIONS[STANDARD_SECTIONS.length - 1];
};

/**
 * Protection ratings (Standard Circuit Breakers)
 */
export const BREAKER_RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

export const getProtectionRating = (current: number) => {
    return BREAKER_RATINGS.find(r => r >= current) || BREAKER_RATINGS[BREAKER_RATINGS.length - 1];
};
