import { cssPpi, pxPerMmFromCssPpi, toDevicePxPerMm } from './calibration.ts';
import { detectCalibration } from './devices.ts';
import type { DisplayInfo } from './display.ts';
import {
  type CalibrationMethod,
  type CalibrationStatus,
  type CalibrationStore,
  findProfileForDisplay,
  STATUS_LABELS,
} from './storage.ts';

export interface ActiveCalibration {
  readonly pxPerMm: number;
  readonly cssPpi: number;
  readonly devicePxPerMm: number;
  readonly method: CalibrationMethod;
  readonly status: CalibrationStatus;
  readonly statusLabel: string;
  readonly label: string;
  readonly basis: string;
  readonly rescaledForZoom: boolean;
  readonly diagonalIn?: number;
  readonly cardWidthPx?: number;
}

/**
 * Resolve the active calibration for `info`.
 * Uses a stored manual profile for this display if one exists (rescaling
 * automatically if browser zoom / OS scaling changed on the same panel);
 * otherwise runs automatic device detection / estimation.
 */
export function resolveCalibration(
  store: CalibrationStore,
  info: DisplayInfo,
): ActiveCalibration {
  const found = findProfileForDisplay(store, info);
  if (found) {
    const { profile, rescaledForZoom } = found;
    return {
      pxPerMm: profile.pxPerMm,
      cssPpi: cssPpi(profile.pxPerMm),
      devicePxPerMm: profile.devicePxPerMm,
      method: profile.method,
      status: profile.status,
      statusLabel: STATUS_LABELS[profile.status],
      label: profile.label,
      basis: rescaledForZoom
        ? 'Manual calibration adjusted for current zoom or scaling'
        : profile.method === 'card'
          ? 'Calibrated against an ISO/IEC 7810 ID-1 card (85.60 × 53.98 mm)'
          : 'Calibrated from entered display diagonal',
      rescaledForZoom,
      ...(profile.diagonalIn !== undefined ? { diagonalIn: profile.diagonalIn } : {}),
      ...(profile.cardWidthPx !== undefined ? { cardWidthPx: profile.cardWidthPx } : {}),
    };
  }

  const auto = detectCalibration(info);
  const pxPerMm = pxPerMmFromCssPpi(auto.cssPpi);
  const status: CalibrationStatus = auto.kind === 'detected' ? 'detected' : 'estimated';
  return {
    pxPerMm,
    cssPpi: auto.cssPpi,
    devicePxPerMm: toDevicePxPerMm(pxPerMm, info.dpr),
    method: 'auto-detect',
    status,
    statusLabel: STATUS_LABELS[status],
    label: auto.label,
    basis: auto.basis,
    rescaledForZoom: false,
  };
}
