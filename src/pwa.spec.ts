import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('PWA configuration', () => {
  it('ngsw-config.json exists and has assetGroups', () => {
    const configPath = join(process.cwd(), 'ngsw-config.json');
    const raw = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);
    expect(config.assetGroups).toBeDefined();
    expect(Array.isArray(config.assetGroups)).toBe(true);
    expect(config.assetGroups.length).toBeGreaterThan(0);
  });

  it('ngsw-config.json has dataGroups', () => {
    const configPath = join(process.cwd(), 'ngsw-config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(config.dataGroups).toBeDefined();
    expect(Array.isArray(config.dataGroups)).toBe(true);
  });

  it('manifest.webmanifest has required fields', () => {
    const manifestPath = join(process.cwd(), 'src', 'manifest.webmanifest');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBe('World Cup 2026 Live');
    expect(manifest.theme_color).toBe('#111316');
    expect(manifest.background_color).toBe('#111316');
    expect(manifest.display).toBe('standalone');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
