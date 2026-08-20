import { createDatabase } from '../db';
import { createCreator, setVaultPinHash, getVaultPinHash } from '../creator-repository';
import { hashPassword, verifyPassword } from '../../authentication';

describe('creator PIN repository', () => {
  function makeDb() {
    return createDatabase(':memory:');
  }

  function seedCreator(db: ReturnType<typeof createDatabase>, id = 'creator-pin-1') {
    return createCreator(db, { creatorId: id, email: `${id}@example.com` });
  }

  it('getVaultPinHash returns null when no PIN has been set', () => {
    const db = makeDb();
    seedCreator(db);
    expect(getVaultPinHash(db, 'creator-pin-1')).toBeNull();
    db.close();
  });

  it('setVaultPinHash stores a value retrievable by getVaultPinHash', async () => {
    const db = makeDb();
    seedCreator(db);
    const hash = await hashPassword('1234');
    setVaultPinHash(db, 'creator-pin-1', hash);
    expect(getVaultPinHash(db, 'creator-pin-1')).toBe(hash);
    db.close();
  });

  it('stored value is NOT the raw PIN — it is a scrypt hash', async () => {
    const db = makeDb();
    seedCreator(db);
    const hash = await hashPassword('5678');
    setVaultPinHash(db, 'creator-pin-1', hash);
    const stored = getVaultPinHash(db, 'creator-pin-1');
    expect(stored).not.toBe('5678');
    expect(stored).toContain(':'); // scrypt format: salt:keyHex
    db.close();
  });

  it('valid PIN is accepted by verifyPassword against stored hash', async () => {
    const db = makeDb();
    seedCreator(db);
    const hash = await hashPassword('9012');
    setVaultPinHash(db, 'creator-pin-1', hash);
    const stored = getVaultPinHash(db, 'creator-pin-1')!;
    expect(await verifyPassword('9012', stored)).toBe(true);
    db.close();
  });

  it('wrong PIN is rejected by verifyPassword', async () => {
    const db = makeDb();
    seedCreator(db);
    const hash = await hashPassword('1111');
    setVaultPinHash(db, 'creator-pin-1', hash);
    const stored = getVaultPinHash(db, 'creator-pin-1')!;
    expect(await verifyPassword('9999', stored)).toBe(false);
    db.close();
  });

  it('Creator A PIN hash cannot be verified by Creator B PIN', async () => {
    const db = makeDb();
    seedCreator(db, 'creator-pin-a');
    seedCreator(db, 'creator-pin-b');
    const hashA = await hashPassword('1234');
    const hashB = await hashPassword('5678');
    setVaultPinHash(db, 'creator-pin-a', hashA);
    setVaultPinHash(db, 'creator-pin-b', hashB);
    const storedA = getVaultPinHash(db, 'creator-pin-a')!;
    expect(await verifyPassword('5678', storedA)).toBe(false);
    const storedB = getVaultPinHash(db, 'creator-pin-b')!;
    expect(await verifyPassword('1234', storedB)).toBe(false);
    db.close();
  });

  it('setVaultPinHash overwrites previous hash', async () => {
    const db = makeDb();
    seedCreator(db);
    const hash1 = await hashPassword('1111');
    setVaultPinHash(db, 'creator-pin-1', hash1);
    const hash2 = await hashPassword('2222');
    setVaultPinHash(db, 'creator-pin-1', hash2);
    const stored = getVaultPinHash(db, 'creator-pin-1')!;
    expect(await verifyPassword('2222', stored)).toBe(true);
    expect(await verifyPassword('1111', stored)).toBe(false);
    db.close();
  });

  it('getVaultPinHash returns null for a creator that does not exist', () => {
    const db = makeDb();
    expect(getVaultPinHash(db, 'ghost-creator')).toBeNull();
    db.close();
  });
});
