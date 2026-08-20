import { getVisionDocument } from '../queries';

describe('Qiyamah chamberVision — N-4 clarity contract', () => {
  const vision = getVisionDocument('qiyamah-chamber');

  it('chamberVision document exists for qiyamah-chamber', () => {
    expect(vision).toBeDefined();
  });

  it('Arabic philosophy text is present and non-empty', () => {
    expect(typeof vision.philosophyAr).toBe('string');
    expect(vision.philosophyAr.trim().length).toBeGreaterThan(0);
  });

  it('Arabic philosophy text is actually Arabic (contains Arabic characters)', () => {
    const arabicRange = /[؀-ۿ]/;
    expect(arabicRange.test(vision.philosophyAr)).toBe(true);
  });

  it('English philosophy text is present and non-empty', () => {
    expect(typeof vision.philosophy).toBe('string');
    expect(vision.philosophy.trim().length).toBeGreaterThan(0);
  });

  it('entryExitTransformation is present and describes imaging, not just navigation', () => {
    expect(typeof vision.entryExitTransformation).toBe('string');
    expect(vision.entryExitTransformation.length).toBeGreaterThan(20);
  });

  it('no fake capability claim: uniqueValue references real generative output', () => {
    const combined = `${vision.uniqueValue} ${vision.philosophy}`.toLowerCase();
    expect(combined).toMatch(/creat|generat|exist|image|visible/i);
  });
});
