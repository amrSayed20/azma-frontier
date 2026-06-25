/**
 * AZMA OS – Al-Wateen Assistant
 * File: al-wateen-registry.ts
 *
 * Registry system for component discovery and management.
 */

export interface RegistryEntry {
  readonly id: string;
  readonly type: string;
  readonly name: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly registeredAt: number;
}

export interface ComponentRegistry {
  readonly chambers: readonly RegistryEntry[];
  readonly agents: readonly RegistryEntry[];
  readonly services: readonly RegistryEntry[];
  readonly providers: readonly RegistryEntry[];
  readonly gateways: readonly RegistryEntry[];
}

export class AlWateenRegistry {
  private entries: Map<string, RegistryEntry> = new Map();
  private typeIndex: Map<string, string[]> = new Map();

  constructor() {
    this.initializeTypeIndex();
  }

  private initializeTypeIndex(): void {
    this.typeIndex.set('CHAMBER', []);
    this.typeIndex.set('AGENT', []);
    this.typeIndex.set('SERVICE', []);
    this.typeIndex.set('PROVIDER', []);
    this.typeIndex.set('GATEWAY', []);
  }

  public register(entry: RegistryEntry): void {
    this.entries.set(entry.id, entry);
    const typeIds = this.typeIndex.get(entry.type) || [];
    if (!typeIds.includes(entry.id)) {
      this.typeIndex.set(entry.type, [...typeIds, entry.id]);
    }
  }

  public unregister(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      this.entries.delete(id);
      const typeIds = this.typeIndex.get(entry.type) || [];
      this.typeIndex.set(entry.type, typeIds.filter(tid => tid !== id));
    }
  }

  public get(id: string): RegistryEntry | undefined {
    return this.entries.get(id);
  }

  public getByType(type: string): readonly RegistryEntry[] {
    const ids = this.typeIndex.get(type) || [];
    return ids
      .map(id => this.entries.get(id))
      .filter((entry): entry is RegistryEntry => entry !== undefined);
  }

  public getAll(): readonly RegistryEntry[] {
    return Array.from(this.entries.values());
  }

  public exists(id: string): boolean {
    return this.entries.has(id);
  }

  public getRegistry(): ComponentRegistry {
    return {
      chambers: this.getByType('CHAMBER'),
      agents: this.getByType('AGENT'),
      services: this.getByType('SERVICE'),
      providers: this.getByType('PROVIDER'),
      gateways: this.getByType('GATEWAY')
    };
  }

  public clear(): void {
    this.entries.clear();
    this.initializeTypeIndex();
  }

  public size(): number {
    return this.entries.size;
  }
}
